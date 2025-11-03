/**
 * Script to mark existing users as email verified
 * Run this after implementing email verification to grandfather existing users
 * 
 * Usage: node scripts/verify-existing-users.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyExistingUsers() {
  try {
    console.log('🔍 Finding existing unverified users...');

    // Get count of unverified users
    const unverifiedCount = await prisma.user.count({
      where: {
        isEmailVerified: false
      }
    });

    console.log(`📊 Found ${unverifiedCount} unverified users`);

    if (unverifiedCount === 0) {
      console.log('✅ No users to verify. All users are already verified!');
      return;
    }

    // Ask for confirmation (in production, you might want to add a prompt here)
    console.log('⚠️  This will mark all existing users as email verified.');
    console.log('   If you want to require verification for existing users, cancel this script.');
    
    // Update all unverified users created before today
    const implementationDate = new Date('2024-11-02T00:00:00Z'); // Update this to your implementation date
    
    const result = await prisma.user.updateMany({
      where: {
        isEmailVerified: false,
        createdAt: {
          lt: implementationDate
        }
      },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log(`✅ Successfully verified ${result.count} existing users`);
    console.log('📧 These users can now login without email verification');
    console.log('🆕 New users registered after implementation will still need to verify their email');

  } catch (error) {
    console.error('❌ Error verifying existing users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
verifyExistingUsers()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
