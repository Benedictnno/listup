const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateListingsCategories() {
  try {
    console.log('🔄 Starting listings category migration...');
    
    // Step 1: Get all listings
    const listings = await prisma.listing.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`📊 Found ${listings.length} listings to process`);
    
    // Step 2: Get all categories
    const categories = await prisma.category.findMany();
    console.log(`📋 Available categories: ${categories.length}`);
    
    // Step 3: Process each listing
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const listing of listings) {
      console.log(`\n🔍 Processing listing: "${listing.title}"`);
      
      if (listing.category) {
        console.log(`   • Already has category: ${listing.category.name}`);
        skippedCount++;
        continue;
      }
      
      // Try to determine category from existing data or set a default
      let categoryId = null;
      
      // You can add logic here to map existing category names to new category IDs
      // For now, let's assign a default category
      const defaultCategory = categories.find(cat => cat.slug === 'fashion-clothing');
      if (defaultCategory) {
        categoryId = defaultCategory.id;
        console.log(`   • Assigning default category: ${defaultCategory.name}`);
      }
      
      if (categoryId) {
        try {
          await prisma.listing.update({
            where: { id: listing.id },
            data: { categoryId: categoryId }
          });
          updatedCount++;
          console.log(`   ✅ Updated listing with category ID: ${categoryId}`);
        } catch (error) {
          console.error(`   ❌ Error updating listing ${listing.id}:`, error.message);
        }
      } else {
        console.log(`   ⚠️ No suitable category found for this listing`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Listings updated: ${updatedCount}`);
    console.log(`   • Listings skipped (already had category): ${skippedCount}`);
    console.log(`   • Total listings processed: ${listings.length}`);
    
    // Step 4: Show final statistics
    const finalStats = await prisma.listing.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📋 Final category distribution:');
    for (const stat of finalStats) {
      if (stat.categoryId) {
        const category = categories.find(cat => cat.id === stat.categoryId);
        const categoryName = category ? category.name : 'Unknown';
        console.log(`   • ${categoryName}: ${stat._count.id} listings`);
      } else {
        console.log(`   • No category: ${stat._count.id} listings`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
migrateListingsCategories();
