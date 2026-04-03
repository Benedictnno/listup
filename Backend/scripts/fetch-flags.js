const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flags = await prisma.featureFlag.findMany();
  console.log(JSON.stringify(flags, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
