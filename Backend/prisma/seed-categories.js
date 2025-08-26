const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  {
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets"
  },
  {
    name: "Fashion & Clothing",
    slug: "fashion-clothing"
  },
  {
    name: "Home & Furniture",
    slug: "home-furniture"
  },
  {
    name: "Books & Education",
    slug: "books-education"
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors"
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care"
  },
  {
    name: "Automotive & Parts",
    slug: "automotive-parts"
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness"
  },
  {
    name: "Toys & Games",
    slug: "toys-games"
  },
  {
    name: "Food & Beverages",
    slug: "food-beverages"
  },
  {
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories"
  },
  {
    name: "Art & Collectibles",
    slug: "art-collectibles"
  },
  {
    name: "Tools & Hardware",
    slug: "tools-hardware"
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies"
  },
  {
    name: "Baby & Kids",
    slug: "baby-kids"
  }
];

async function seedCategories() {
  try {
    console.log('🌱 Starting category seeding...');
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });
      
      if (existingCategory) {
        console.log(`✅ Category "${categoryData.name}" already exists`);
      } else {
        const category = await prisma.category.create({
          data: categoryData
        });
        console.log(`✅ Created category: ${category.name} (${category.slug})`);
      }
    }
    
    console.log('🎉 Category seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('✅ Categories seeded successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed to seed categories:', error);
      process.exit(1);
    });
}

module.exports = { seedCategories };
