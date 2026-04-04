const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

async function categorizeProducts() {
  const isDryRun = process.argv.includes('--dry-run');
  const BATCH_SIZE = 10;

  try {
    console.log('🌱 Starting Product Categorization...');
    if (isDryRun) console.log('⚠️ DRY RUN MODE: No changes will be saved to the database.');

    // 1. Fetch all existing categories (Taxonomy)
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });

    if (categories.length === 0) {
      console.error('❌ No categories found in the database. Please seed categories first.');
      return;
    }

    const taxonomy = categories.map(c => `${c.id}: ${c.name}`).join('\n');

    // 2. Fetch uncategorized listings
    const uncategorizedListings = await prisma.listing.findMany({
      where: { categoryId: null, isActive: true },
      select: { id: true, title: true, description: true }
    });

    console.log(`🔍 Found ${uncategorizedListings.length} uncategorized listings.`);

    if (uncategorizedListings.length === 0) {
      console.log('✅ All listings are already categorized.');
      return;
    }

    // 3. Process in batches
    for (let i = 0; i < uncategorizedListings.length; i += BATCH_SIZE) {
      const batch = uncategorizedListings.slice(i, i + BATCH_SIZE);
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uncategorizedListings.length / BATCH_SIZE)}...`);

      const tasks = batch.map(async (listing) => {
        const prompt = `
          You are a product categorization expert for the ListUp Marketplace.
          Given the following product:
          Title: "${listing.title}"
          Description: "${listing.description || 'No description provided'}"

          And these available categories:
          ${taxonomy}

          Choose the most appropriate Category ID. 
          If none fit well, respond with "NULL".
          RESPOND ONLY with the Category ID string.
        `;

        try {
          const result = await model.generateContent(prompt);
          const predictedId = result.response.text().trim();

          // Validate if the predictedId exists in our categories
          const matchedCategory = categories.find(c => c.id === predictedId);

          if (matchedCategory) {
            console.log(`✨ [${matchedCategory.name}] Predicted for: "${listing.title}"`);
            
            if (!isDryRun) {
              await prisma.listing.update({
                where: { id: listing.id },
                data: { categoryId: matchedCategory.id }
              });
            }
          } else {
            console.warn(`❓ No suitable match for: "${listing.title}" (Model returned: ${predictedId})`);
          }
        } catch (err) {
          console.error(`❌ Error predicting for "${listing.title}":`, err.message);
        }
      });

      await Promise.all(tasks);
      
      // Delay to avoid rate limits
      if (i + BATCH_SIZE < uncategorizedListings.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('✅ Categorization task complete.');

  } catch (error) {
    console.error('❌ Critical Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

categorizeProducts();
