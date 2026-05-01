const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixIndex() {
  try {
    console.log('✅ Connected via Prisma');
    
    console.log('🔍 Dropping old phone index...');
    // In MongoDB, we can drop the index by name or by key.
    // Prisma doesn't have a direct "dropIndex" but we can use runCommandRaw
    try {
      await prisma.$runCommandRaw({
        dropIndexes: "User",
        index: "phone_1"
      });
      console.log('🗑️  Dropped index "phone_1"');
    } catch (e) {
      console.log('ℹ️  Index "phone_1" not found or already dropped.');
    }

    console.log('✨ Creating new UNIQUE and SPARSE index for "phone"...');
    await prisma.$runCommandRaw({
      createIndexes: "User",
      indexes: [
        {
          key: { phone: 1 },
          name: "phone_1",
          unique: true,
          sparse: true
        }
      ]
    });

    console.log('✅ Successfully fixed the index using Prisma! Multiple NULL phones are now allowed.');

  } catch (error) {
    console.error('❌ Error fixing index:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixIndex();
