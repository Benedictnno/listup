#!/usr/bin/env node

/**
 * Manual User Verification Script
 * 
 * Use this script to manually verify users if email delivery is broken.
 * This is a temporary workaround while you fix the email configuration.
 * 
 * Usage:
 *   node manually-verify-user.js user@example.com
 *   node manually-verify-user.js --all  (verify all users - USE WITH CAUTION)
 */

require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function verifyUser(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      return false;
    }

    if (user.isEmailVerified) {
      console.log(`⚠️  User ${email} is already verified`);
      return true;
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log(`✅ Successfully verified user: ${email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Verified At: ${new Date().toISOString()}`);

    return true;
  } catch (error) {
    console.error(`❌ Error verifying user: ${error.message}`);
    return false;
  }
}

async function verifyAllUsers() {
  try {
    console.log('⚠️  WARNING: This will verify ALL unverified users!');
    console.log('⏳ Waiting 3 seconds... Press Ctrl+C to cancel\n');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔍 Finding unverified users...');
    
    const unverifiedUsers = await prisma.user.findMany({
      where: { isEmailVerified: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (unverifiedUsers.length === 0) {
      console.log('✅ No unverified users found!');
      return;
    }

    console.log(`📋 Found ${unverifiedUsers.length} unverified users:`);
    unverifiedUsers.forEach((user, i) => {
      console.log(`   ${i + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });

    console.log('\n🔄 Verifying all users...');

    const result = await prisma.user.updateMany({
      where: { isEmailVerified: false },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      }
    });

    console.log(`✅ Successfully verified ${result.count} users`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error verifying users: ${error.message}`);
    return false;
  }
}

async function listUnverifiedUsers() {
  try {
    console.log('🔍 Listing all unverified users...\n');
    
    const unverifiedUsers = await prisma.user.findMany({
      where: { isEmailVerified: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (unverifiedUsers.length === 0) {
      console.log('✅ No unverified users found!');
      return;
    }

    console.log(`Found ${unverifiedUsers.length} unverified users:\n`);
    unverifiedUsers.forEach((user, i) => {
      const daysSince = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Registered: ${user.createdAt.toISOString()} (${daysSince} days ago)`);
      console.log('');
    });

    console.log('💡 To verify a specific user, run:');
    console.log('   node manually-verify-user.js user@example.com');
    console.log('\n⚠️  To verify ALL users (use with caution), run:');
    console.log('   node manually-verify-user.js --all');

  } catch (error) {
    console.error(`❌ Error listing users: ${error.message}`);
  }
}

async function main() {
  const args = process.argv.slice(2);

  console.log('\n' + '='.repeat(70));
  console.log('👤 MANUAL USER VERIFICATION TOOL');
  console.log('='.repeat(70) + '\n');

  try {
    await prisma.$connect();

    if (args.length === 0) {
      // No arguments - list unverified users
      await listUnverifiedUsers();
    } else if (args[0] === '--all' || args[0] === '-a') {
      // Verify all users
      await verifyAllUsers();
    } else if (args[0] === '--list' || args[0] === '-l') {
      // List unverified users
      await listUnverifiedUsers();
    } else if (args[0] === '--help' || args[0] === '-h') {
      // Show help
      console.log('Usage:');
      console.log('  node manually-verify-user.js                 # List unverified users');
      console.log('  node manually-verify-user.js user@email.com  # Verify specific user');
      console.log('  node manually-verify-user.js --all           # Verify ALL users');
      console.log('  node manually-verify-user.js --list          # List unverified users');
      console.log('  node manually-verify-user.js --help          # Show this help');
    } else {
      // Assume it's an email address
      const email = args[0];
      await verifyUser(email);
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('\n' + '='.repeat(70) + '\n');
  }
}

main().catch(console.error);
