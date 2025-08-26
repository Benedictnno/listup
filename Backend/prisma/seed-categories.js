const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  // Electronics & Technology
  {
    name: "Electronics & Gadgets",
    slug: "electronics-gadgets"
  },
  {
    name: "Computers & Laptops",
    slug: "computers-laptops"
  },
  {
    name: "Mobile Phones & Tablets",
    slug: "mobile-phones-tablets"
  },
  {
    name: "Audio & Headphones",
    slug: "audio-headphones"
  },
  {
    name: "Gaming & Consoles",
    slug: "gaming-consoles"
  },
  {
    name: "Photography & Cameras",
    slug: "photography-cameras"
  },

  // Fashion & Style
  {
    name: "Fashion & Clothing",
    slug: "fashion-clothing"
  },
  {
    name: "Shoes & Footwear",
    slug: "shoes-footwear"
  },
  {
    name: "Bags & Backpacks",
    slug: "bags-backpacks"
  },
  {
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories"
  },
  {
    name: "Watches & Timepieces",
    slug: "watches-timepieces"
  },

  // Academic & Education
  {
    name: "Books & Education",
    slug: "books-education"
  },
  {
    name: "Textbooks & Course Materials",
    slug: "textbooks-course-materials"
  },
  {
    name: "Stationery & Office Supplies",
    slug: "stationery-office-supplies"
  },
  {
    name: "Art & Craft Supplies",
    slug: "art-craft-supplies"
  },
  {
    name: "Musical Instruments",
    slug: "musical-instruments"
  },

  // Home & Living
  {
    name: "Home & Furniture",
    slug: "home-furniture"
  },
  {
    name: "Kitchen & Dining",
    slug: "kitchen-dining"
  },
  {
    name: "Bedding & Bath",
    slug: "bedding-bath"
  },
  {
    name: "Home Decor & Lighting",
    slug: "home-decor-lighting"
  },
  {
    name: "Garden & Outdoor",
    slug: "garden-outdoor"
  },

  // Lifestyle & Wellness
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors"
  },
  {
    name: "Fitness & Exercise",
    slug: "fitness-exercise"
  },
  {
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care"
  },
  {
    name: "Health & Wellness",
    slug: "health-wellness"
  },
  {
    name: "Skincare & Cosmetics",
    slug: "skincare-cosmetics"
  },

  // Transportation
  {
    name: "Automotive & Parts",
    slug: "automotive-parts"
  },
  {
    name: "Bicycles & Cycling",
    slug: "bicycles-cycling"
  },
  {
    name: "Motorcycles & Scooters",
    slug: "motorcycles-scooters"
  },

  // Entertainment & Hobbies
  {
    name: "Toys & Games",
    slug: "toys-games"
  },
  {
    name: "Board Games & Puzzles",
    slug: "board-games-puzzles"
  },
  {
    name: "Art & Collectibles",
    slug: "art-collectibles"
  },
  {
    name: "Movies & Music",
    slug: "movies-music"
  },
  {
    name: "Hobbies & Crafts",
    slug: "hobbies-crafts"
  },

  // Food & Beverages
  {
    name: "Food & Beverages",
    slug: "food-beverages"
  },
  {
    name: "Snacks & Treats",
    slug: "snacks-treats"
  },
  {
    name: "Beverages & Drinks",
    slug: "beverages-drinks"
  },

  // Tools & DIY
  {
    name: "Tools & Hardware",
    slug: "tools-hardware"
  },
  {
    name: "DIY & Home Improvement",
    slug: "diy-home-improvement"
  },
  {
    name: "Building & Construction",
    slug: "building-construction"
  },

  // Special Categories
  {
    name: "Pet Supplies",
    slug: "pet-supplies"
  },
  {
    name: "Baby & Kids",
    slug: "baby-kids"
  },
  {
    name: "Vintage & Antiques",
    slug: "vintage-antiques"
  },
  {
    name: "Handmade & Custom",
    slug: "handmade-custom"
  },
  {
    name: "Services & Skills",
    slug: "services-skills"
  },
  {
    name: "Tickets & Events",
    slug: "tickets-events"
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
