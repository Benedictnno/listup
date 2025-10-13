const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    const adminEmail = 'benedictnnaoma0@gmail.com';
    const adminPassword = 'Chigozie0@';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating role to ADMIN...');
      
      // Update existing user to admin
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: 'ADMIN',
          password: await bcrypt.hash(adminPassword, 12)
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email:', updatedAdmin.email);
      console.log('🔑 Role:', updatedAdmin.role);
      
    } else {
      console.log('👤 Creating new admin user...');
      
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      // Create new admin user
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          phone: null
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email:', adminUser.email);
      console.log('🔑 Role:', adminUser.role);
      console.log('🆔 ID:', adminUser.id);
    }

    console.log('\n🎉 Admin seeding completed!');
    console.log('📝 You can now login to the admin panel with:');
    console.log('   Email: benedictnnaoma0@gmail.com');
    console.log('   Password: Chigozie0@');
    console.log('   URL: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedAdmin()
  .then(() => {
    console.log('\n✅ Seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  });
