require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function main() {
  const categories = await prisma.category.findMany();
  
  // It seems like there's 117 records.
  const uncategorized = await prisma.listing.findMany({ 
    where: { 
      OR: [
        { categoryId: null },
        { categoryId: { isSet: false } }, // mongo explicit
        { categoryId: categories.find(c => c.name === 'All Categories')?.id || 'not_valid'} // in case script dumped them to fallback
      ]
    }, 
    select: { id: true, title: true, description: true } 
  });
  
  if (uncategorized.length === 0) {
    console.log("No uncategorized listings found.");
    return;
  }

  const getCategoryId = (name) => categories.find(c => c.name.toLowerCase() === name.toLowerCase())?.id;
  const matchCategory = (title, desc) => {
    const txt = (title + ' ' + desc).toLowerCase();
    
    // Fashion/Clothing
    if (txt.includes('watch') || txt.includes('necklace') || txt.includes('bracelet') || txt.includes('g shock') || txt.includes('poedagar') || txt.includes('jewelry') || txt.includes('mont blac') || txt.includes('t-shirt') || txt.includes('sneaker') || txt.includes('bag')) return getCategoryId('Fashion & Clothing');
    
    // Food
    if (txt.includes('food') || txt.includes('buns') || txt.includes('egg roll') || txt.includes('shawarma') || txt.includes('rice') || txt.includes('snack') || txt.includes('cake') || txt.includes('pastry')) return getCategoryId('Food & Snacks');
    
    // Electronics
    if (txt.includes('phone') || txt.includes('laptop') || txt.includes('airpod') || txt.includes('earpod') || txt.includes('charger') || txt.includes('apple') || txt.includes('samsung') || txt.includes('console') || txt.includes('ps4') || txt.includes('ps5')) return getCategoryId('Electronics');
    
    // Default fallback
    return getCategoryId('All Categories');
  };

  let updatedCount = 0;
  // Use promise.all for faster execution
  await Promise.all(uncategorized.map(async (item) => {
    const catId = matchCategory(item.title, item.description || "");
    if (catId) {
      await prisma.listing.update({
        where: { id: item.id },
        data: { categoryId: catId }
      });
      updatedCount++;
    }
  }));

  console.log(`Successfully mapped ${updatedCount} out of ${uncategorized.length} listings!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
