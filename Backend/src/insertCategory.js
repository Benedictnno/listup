const prisma = require('./lib/prisma');

async function insertCategories() {
  const categories = [
    { name: "All Categories", slug: "all-categories" },
    { name: "Food & Snacks", slug: "food-snacks" },
    { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
    { name: "Fashion & Clothing", slug: "fashion-clothing" },
    { name: "Electronics", slug: "electronics" },
    { name: "Computers", slug: "computers" },
    { name: "Mobile Phones", slug: "mobile-phones" },
    { name: "Audio", slug: "audio" },
    { name: "Handmade & Crafts", slug: "handmade-crafts" }
  ];

  try {
    console.log("🌱 Inserting categories...");
    
    // Use upsert to avoid unique constraint errors if some already exist
    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: { name: cat.name },
            create: cat
        });
    }

    console.log(`✅ Categories inserted/updated successfully.`);
  } catch (error) {
    console.error('❌ Error inserting categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

insertCategories().catch(console.error);
