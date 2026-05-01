const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dropBadIndex() {
  try {
    console.log('✅ Connected via Prisma');
    
    console.log('🗑️ Dropping the non-sparse index "User_phone_key"...');
    try {
      await prisma.$runCommandRaw({
        dropIndexes: "User",
        index: "User_phone_key"
      });
      console.log('✅ Successfully dropped "User_phone_key"');
    } catch (e) {
      console.log('ℹ️ Index "User_phone_key" not found or already dropped.');
    }

    // Verify phone_1 still exists
    const result = await prisma.$runCommandRaw({
      listIndexes: "User"
    });
    
    const phone1 = result.cursor.firstBatch.find(idx => idx.name === "phone_1");
    if (phone1 && phone1.sparse) {
      console.log('✨ "phone_1" (Sparse & Unique) is still active. You are protected!');
    } else {
      console.log('⚠️  Warning: Sparse index "phone_1" missing. Re-running creation...');
      await prisma.$runCommandRaw({
        createIndexes: "User",
        indexes: [{ key: { phone: 1 }, name: "phone_1", unique: true, sparse: true }]
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

dropBadIndex();
