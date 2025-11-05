#!/usr/bin/env node

/**
 * Quick check to see verification status of users
 */

require('dotenv').config();
const prisma = require('./src/lib/prisma');

async function checkUsers() {
  try {
    await prisma.$connect();
    console.log('Connected to database\n');

    // Get a few sample users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
        createdAt: true
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    console.log('Latest 10 Users:');
    console.log('='.repeat(80));
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   isEmailVerified: ${user.isEmailVerified}`);
      console.log(`   emailVerifiedAt: ${user.emailVerifiedAt || 'Not set'}`);
      console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`);
      console.log('');
    });

    // Count stats
    const total = await prisma.user.count();
    const verified = await prisma.user.count({
      where: { isEmailVerified: true }
    });
    const notVerified = await prisma.user.count({
      where: { NOT: { isEmailVerified: true } }
    });

    console.log('='.repeat(80));
    console.log('Statistics:');
    console.log(`Total users: ${total}`);
    console.log(`Verified: ${verified}`);
    console.log(`Not verified: ${notVerified}`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkUsers();
