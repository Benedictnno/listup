const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.featureFlag.update({
    where: { key: 'Paid_Listing_Promotion' },
    data: { key: 'listing_promotion' }
  });
  console.log('✅ Renamed Paid_Listing_Promotion to listing_promotion:', result);
}

main().catch(console.error).finally(() => prisma.$disconnect());
