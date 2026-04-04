const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tiers = [
    {
      name: 'Starter',
      description: 'Perfect for casual selling',
      price: 1000,
      slots: 3
    },
    {
      name: 'Professional',
      description: 'Best for growing stores',
      price: 3000,
      slots: 10
    },
    {
      name: 'Enterprise',
      description: 'Maximum reach and volume',
      price: 5000,
      slots: 20
    }
  ];

  console.log('Seeding listing tiers...');

  for (const tier of tiers) {
    await prisma.listingTier.upsert({
      where: { name: tier.name },
      update: tier,
      create: tier,
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
