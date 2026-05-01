const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectIndexes() {
  try {
    console.log('--- Detailed Index Inspection ---');
    
    // Get all indexes for the User collection
    const result = await prisma.$runCommandRaw({
      listIndexes: "User"
    });

    console.log(JSON.stringify(result, null, 2));

    const phoneIndex = result.cursor.firstBatch.find(idx => idx.key.phone);
    
    if (phoneIndex) {
      console.log('\n📱 Phone Index Found:');
      console.log(`   Name: ${phoneIndex.name}`);
      console.log(`   Unique: ${phoneIndex.unique}`);
      console.log(`   Sparse: ${phoneIndex.sparse || 'false (⚠️ WARNING)'}`);
      
      if (!phoneIndex.sparse) {
        console.log('\n❌ THE INDEX IS NOT SPARSE. Google sign-in will continue to fail for multiple users.');
      } else {
        console.log('\n✅ THE INDEX IS SPARSE. The collision must be on a real value, not NULL.');
      }
    } else {
      console.log('\n❓ No phone index found at all!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectIndexes();
