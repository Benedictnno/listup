const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  // All Categories as specified by user
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

async function addCategories() {
  try {
    console.log('🌱 Starting to add all categories...');
    
    const createdCategories = [];
    
    for (const categoryData of defaultCategories) {
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
        console.log(`✅ Category "${categoryData.name}" already exists`);
      }
    }
    
    console.log(`🎉 Category addition completed! ${createdCategories.length} new categories created.`);
    console.log(`📊 Total categories in database: ${await prisma.category.count()}`);
    
  } catch (error) {
    console.error('❌ Error adding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addCategories();
