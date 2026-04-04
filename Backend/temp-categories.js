require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function main() {
  console.log("Fetching categories...");
  const categories = await prisma.category.findMany();
  console.log('Categories:', categories);

  console.log("Fetching uncategorized...");
  const uncategorized = await prisma.listing.findMany({ 
    where: { 
      OR: [
        { categoryId: null },
        { categoryId: { isSet: false } }
      ]
    }, 
    select: { title: true, description: true, id: true }, 
    take: 10 
  });
  console.log('Sample Uncategorized:', uncategorized);

  const totalUncategorized = await prisma.listing.count({
    where: { 
      OR: [
        { categoryId: null },
        { categoryId: { isSet: false } }
      ]
    }
  });
  console.log('Total Uncategorized:', totalUncategorized);
}

main().catch(console.error).finally(() => prisma.$disconnect());
