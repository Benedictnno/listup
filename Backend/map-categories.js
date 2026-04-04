require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function main() {
  const categories = await prisma.category.findMany();
  console.log('Categories found:', categories.map(c => ({ name: c.name, id: c.id })));

  const uncategorized = await prisma.listing.findMany({ 
    where: { 
      OR: [
        { categoryId: null },
        { categoryId: { isSet: false } }
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
    if (txt.includes('watch') || txt.includes('necklace') || txt.includes('bracelet') || txt.includes('g shock') || txt.includes('poedagar') || txt.includes('jewelry') || txt.includes('mont blac') || txt.includes('t-shirt') || txt.includes('sneaker') || txt.includes('bag')) return getCategoryId('Fashion & Accessories') || getCategoryId('Fashion');
    
    // Food
    if (txt.includes('food') || txt.includes('buns') || txt.includes('egg roll') || txt.includes('shawarma') || txt.includes('rice') || txt.includes('snack') || txt.includes('cake') || txt.includes('pastry')) return getCategoryId('Food & Drinks') || getCategoryId('Food');
    
    // Electronics
    if (txt.includes('phone') || txt.includes('laptop') || txt.includes('airpod') || txt.includes('earpod') || txt.includes('charger') || txt.includes('apple') || txt.includes('samsung') || txt.includes('console') || txt.includes('ps4') || txt.includes('ps5')) return getCategoryId('Electronics') || getCategoryId('Gadgets');
    
    // Default fallback - Miscellaneous or the first category if others fail
    return getCategoryId('Miscellaneous') || getCategoryId('Other') || categories.find(c => c.name.includes('Health'))?.id || categories[0].id;
  };

  let updatedCount = 0;
  for (const item of uncategorized) {
    const catId = matchCategory(item.title, item.description || "");
    if (catId) {
      await prisma.listing.update({
        where: { id: item.id },
        data: { categoryId: catId }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully mapped ${updatedCount} out of ${uncategorized.length} listings!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
