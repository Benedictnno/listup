const { PrismaClient } = require('@prisma/client');

// Use the same database as the main backend
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

// Handle graceful shutdown
const shutdown = async () => {
    console.log('📦 Disconnecting Prisma Client...');
    await prisma.$disconnect();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
