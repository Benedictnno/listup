const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('\n❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set as environment variables.');
    console.error('   Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=strongPassword node seed-admin.js');
    process.exit(1);
  }

  try {
    console.log('🌱 Seeding admin user...');

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating role to ADMIN...');
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
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
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
    console.log('   Email:', adminEmail);
    console.log('   URL: http://localhost:3001');

  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin()
  .then(() => {
    console.log('\n✅ Seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  });
