const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial addresses...');
  const addresses = [
    { name: 'Ikeja, Lagos', active: true },
    { name: 'Yaba, Lagos', active: true },
    { name: 'Lekki, Lagos', active: true },
    { name: 'Abuja FCT', active: true },
    { name: 'Port Harcourt, Rivers', active: true }
  ];

  for (const addr of addresses) {
    await prisma.address.upsert({
      where: { name: addr.name },
      update: {},
      create: addr,
    });
  }
  
  console.log('Addresses seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
