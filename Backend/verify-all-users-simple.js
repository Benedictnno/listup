#!/usr/bin/env node

/**
 * Simple script to verify ALL users
 * No fancy queries - just get all users and update them
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllUsers() {
  try {
    console.log('\n🔄 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Connected!\n');

    // Get ALL users
    console.log('📋 Fetching all users...');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        isEmailVerified: true
      }
    });

    console.log(`Found ${allUsers.length} total users\n`);

    // Filter unverified
    const unverified = allUsers.filter(u => !u.isEmailVerified);
    const verified = allUsers.filter(u => u.isEmailVerified);

    console.log(`✅ Already verified: ${verified.length}`);
    console.log(`❌ Need verification: ${unverified.length}\n`);

    if (unverified.length === 0) {
      console.log('🎉 All users are already verified!\n');
      await prisma.$disconnect();
      return;
    }

    console.log('⚠️  Will verify these users:');
    unverified.slice(0, 10).forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email}`);
    });
    if (unverified.length > 10) {
      console.log(`  ... and ${unverified.length - 10} more`);
    }
    console.log('');

    console.log('⏳ Starting in 3 seconds... (Ctrl+C to cancel)\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('🔄 Updating users...\n');

    const now = new Date();
    let updated = 0;

    // Update each user individually to avoid query issues
    for (const user of unverified) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isEmailVerified: true,
            emailVerifiedAt: now
          }
        });
        updated++;
        if (updated % 10 === 0) {
          console.log(`  Updated ${updated}/${unverified.length}...`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to update ${user.email}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully verified ${updated} users!\n`);

    // Verify the result
    const stillUnverified = await prisma.user.count({
      where: { isEmailVerified: false }
    });

    console.log('📊 Final check:');
    console.log(`  Still unverified: ${stillUnverified}`);
    
    if (stillUnverified === 0) {
      console.log('\n🎉 All users are now verified!\n');
    } else {
      console.log(`\n⚠️  ${stillUnverified} users still need attention\n`);
    }

    await prisma.$disconnect();

  } catch (error) {
    console.error('❌ Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verifyAllUsers();
