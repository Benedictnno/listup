const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugUserPhones() {
  try {
    console.log('--- Debugging User Phone Numbers ---');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true
      }
    });

    console.log(`Total users: ${users.length}`);

    const phoneGroups = {};
    users.forEach(user => {
      const p = user.phone === null ? 'NULL' : user.phone === undefined ? 'UNDEFINED' : `"${user.phone}"`;
      if (!phoneGroups[p]) phoneGroups[p] = [];
      phoneGroups[p].push(user.email);
    });

    console.log('\nPhone value distribution:');
    for (const [val, emails] of Object.entries(phoneGroups)) {
      console.log(`${val}: ${emails.length} users ${emails.length > 1 ? '⚠️ COLLISION' : ''}`);
      if (emails.length > 1 && val !== 'NULL') {
        console.log(`   Emails: ${emails.join(', ')}`);
      }
    }

    const nullCount = (phoneGroups['NULL'] || []).length;
    if (nullCount > 1) {
      console.log('\n⚠️  MULTIPLE NULL PHONES DETECTED.');
      console.log('This confirms your MongoDB index is NOT sparse.');
      console.log('MongoDB unique indexes block multiple NULLs unless they are sparse.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserPhones();
