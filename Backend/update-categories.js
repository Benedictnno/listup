const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const newCategories = [
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

async function updateCategories() {
  try {
    console.log('🔄 Starting category database update...');
    
    // Step 1: Get existing categories
    const existingCategories = await prisma.category.findMany();
    console.log(`📊 Found ${existingCategories.length} existing categories`);
    
    // Step 2: Clear all existing categories (optional - uncomment if you want to start fresh)
    // console.log('🗑️ Clearing existing categories...');
    // await prisma.category.deleteMany();
    // console.log('✅ Existing categories cleared');
    
    // Step 3: Add new categories
    const createdCategories = [];
    const updatedCategories = [];
    
    for (const categoryData of newCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });
      
      if (!existingCategory) {
        const category = await prisma.category.create({
          data: categoryData
        });
        createdCategories.push(category);
        console.log(`✅ Created category: ${category.name} (${category.slug})`);
      } else {
        // Update existing category if name has changed
        if (existingCategory.name !== categoryData.name) {
          const updatedCategory = await prisma.category.update({
            where: { id: existingCategory.id },
            data: { name: categoryData.name }
          });
          updatedCategories.push(updatedCategory);
          console.log(`🔄 Updated category: ${existingCategory.name} → ${categoryData.name}`);
        } else {
          console.log(`✅ Category "${categoryData.name}" already exists and is up to date`);
        }
      }
    }
    
    // Step 4: Get final category count
    const finalCount = await prisma.category.count();
    
    console.log('\n🎉 Category update completed!');
    console.log(`📊 Summary:`);
    console.log(`   • New categories created: ${createdCategories.length}`);
    console.log(`   • Categories updated: ${updatedCategories.length}`);
    console.log(`   • Total categories in database: ${finalCount}`);
    
    // Step 5: Show all categories
    const allCategories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log('\n📋 All categories in database:');
    allCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
updateCategories();
