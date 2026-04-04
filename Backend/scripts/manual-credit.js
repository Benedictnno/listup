const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function credit() {
  try {
    const email = 'benedictnnaoma0@gmail.com';
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found: ' + email);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { listingLimit: 100 }
    });

    console.log('🚀 SUCCESS: Your listing limit is now 100!');
    console.log('📊 New Listing Limit: ' + updatedUser.listingLimit);
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

credit();
