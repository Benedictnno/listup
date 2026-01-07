#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing MongoDB connection...');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Connected to MongoDB successfully!');

    console.log('⏳ Attempting to count users (this may take up to 30s)...');
    // Test a simple query
    const userCount = await prisma.user.count();

    console.log(`📊 Found ${userCount} users in database`);

    // Test admin user specifically
    const adminUser = await prisma.user.findUnique({
      where: { email: 'benedictnnaoma0@gmail.com' },
      select: { id: true, name: true, email: true, role: true }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   👤 Name: ${adminUser.name}`);
      console.log(`   🔑 Role: ${adminUser.role}`);
    } else {
      console.log('❌ Admin user not found');
    }

    console.log('\n🎉 MongoDB connection test completed successfully!');

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n💡 Solution: MongoDB is not running');
      console.log('   Start MongoDB with: mongod --dbpath C:\\data\\db');
    } else if (error.message.includes('Environment variable not found: DATABASE_URL')) {
      console.log('\n💡 Solution: Missing .env file');
      console.log('   Create .env file with DATABASE_URL="mongodb://localhost:27017/listup"');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
