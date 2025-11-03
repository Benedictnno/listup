/**
 * Database State Checker
 * Run this to verify if email verification schema is applied
 * 
 * Usage: node check-database.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 Checking Database State...\n');

  try {
    // Test 1: Check if we can connect
    console.log('1️⃣ Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`   ✅ Connected! Found ${userCount} users\n`);

    // Test 2: Check if isEmailVerified field exists
    console.log('2️⃣ Checking if isEmailVerified field exists...');
    try {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          email: true,
          isEmailVerified: true
        }
      });
      console.log('   ✅ isEmailVerified field EXISTS');
      console.log(`   Sample user: ${user?.email} - verified: ${user?.isEmailVerified}\n`);
    } catch (error) {
      console.log('   ❌ isEmailVerified field DOES NOT EXIST');
      console.log('   Error:', error.message);
      console.log('   👉 You need to run: npx prisma db push\n');
      return false;
    }

    // Test 3: Check if EmailVerification model exists
    console.log('3️⃣ Checking if EmailVerification model exists...');
    try {
      const verificationCount = await prisma.emailVerification.count();
      console.log(`   ✅ EmailVerification model EXISTS`);
      console.log(`   Found ${verificationCount} verification records\n`);
    } catch (error) {
      console.log('   ❌ EmailVerification model DOES NOT EXIST');
      console.log('   Error:', error.message);
      console.log('   👉 You need to run: npx prisma db push\n');
      return false;
    }

    // Test 4: Check environment variables
    console.log('4️⃣ Checking environment variables...');
    const checks = {
      'DATABASE_URL': !!process.env.DATABASE_URL,
      'RESEND_API_KEY': !!process.env.RESEND_API_KEY,
      'FRONTEND_URL': !!process.env.FRONTEND_URL
    };

    for (const [key, exists] of Object.entries(checks)) {
      if (exists) {
        console.log(`   ✅ ${key} is set`);
      } else {
        console.log(`   ❌ ${key} is MISSING`);
      }
    }
    console.log();

    // Test 5: Sample a user to see current state
    console.log('5️⃣ Checking sample user data...');
    const sampleUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        createdAt: true
      }
    });

    if (sampleUser) {
      console.log('   Sample User:');
      console.log('   - Email:', sampleUser.email);
      console.log('   - Verified:', sampleUser.isEmailVerified);
      console.log('   - Verified At:', sampleUser.emailVerifiedAt || 'Not verified');
      console.log('   - Created:', sampleUser.createdAt);
    } else {
      console.log('   No users found in database');
    }
    console.log();

    console.log('✅ Database is properly configured for email verification!\n');
    return true;

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('\nFull error:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabaseState()
  .then((success) => {
    if (success) {
      console.log('🎉 Everything looks good! Email verification should work.\n');
      console.log('Next steps:');
      console.log('1. Make sure backend is running: npm run dev');
      console.log('2. Test registration endpoint');
      console.log('3. Check backend logs for email sending confirmation');
    } else {
      console.log('⚠️  Database schema needs to be updated!\n');
      console.log('Run these commands:');
      console.log('1. npx prisma generate');
      console.log('2. npx prisma db push');
      console.log('3. node check-database.js (to verify)');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
