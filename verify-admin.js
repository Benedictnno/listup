const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    console.log('🔍 Verifying admin user...');

    const admin = await prisma.user.findUnique({
      where: { email: 'benedictnnaoma0@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (admin) {
      console.log('✅ Admin user found!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.name);
      console.log('🔑 Role:', admin.role);
      console.log('🆔 ID:', admin.id);
      console.log('📅 Created:', admin.createdAt.toLocaleString());
      
      if (admin.role === 'ADMIN') {
        console.log('\n🎉 Admin user is properly configured!');
        console.log('🚀 You can now login to the admin panel at: http://localhost:3001');
      } else {
        console.log('\n⚠️  Warning: User exists but role is not ADMIN');
      }
    } else {
      console.log('❌ Admin user not found in database');
    }

  } catch (error) {
    console.error('❌ Error verifying admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();

