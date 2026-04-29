const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to add 5 listing points to current vendors...');
  
  // Add 5 points to all users who are vendors
  const result = await prisma.user.updateMany({
    where: { 
      role: 'VENDOR' 
    },
    data: {
      listingLimit: {
        increment: 5
      }
    }
  });

  console.log(`Successfully added 5 listing points to ${result.count} vendors.`);
}

main()
  .catch(e => {
    console.error('Error adding listing points:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
