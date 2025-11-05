#!/usr/bin/env node

/**
 * Bulk Verify Existing Users Script
 * 
 * This script automatically verifies all users who registered before
 * the email verification system was working properly.
 * 
 * Usage:
 *   node bulk-verify-existing-users.js --preview  (see what will be verified)
 *   node bulk-verify-existing-users.js --execute  (actually verify them)
 */

require('dotenv').config();
const prisma = require('./src/lib/prisma');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

async function previewUnverifiedUsers() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}📋 PREVIEW: Unverified Users${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    const unverifiedUsers = await prisma.user.findMany({
      where: { isEmailVerified: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    if (unverifiedUsers.length === 0) {
      console.log(`${colors.green}✅ No unverified users found!${colors.reset}`);
      console.log('All users are already verified.\n');
      return 0;
    }

    console.log(`${colors.yellow}Found ${unverifiedUsers.length} unverified users:${colors.reset}\n`);

    // Group by role
    const byRole = {
      USER: [],
      VENDOR: [],
      ADMIN: []
    };

    unverifiedUsers.forEach(user => {
      byRole[user.role].push(user);
    });

    // Display by role
    for (const [role, users] of Object.entries(byRole)) {
      if (users.length > 0) {
        console.log(`${colors.blue}${role}s (${users.length}):${colors.reset}`);
        users.forEach((user, i) => {
          const daysSince = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          console.log(`  ${i + 1}. ${user.email}`);
          console.log(`     Name: ${user.name}`);
          console.log(`     Registered: ${user.createdAt.toISOString().split('T')[0]} (${daysSince} days ago)`);
          console.log('');
        });
      }
    }

    console.log('─'.repeat(70));
    console.log(`${colors.yellow}SUMMARY:${colors.reset}`);
    console.log(`  Total Users: ${unverifiedUsers.length}`);
    console.log(`  - Regular Users: ${byRole.USER.length}`);
    console.log(`  - Vendors: ${byRole.VENDOR.length}`);
    console.log(`  - Admins: ${byRole.ADMIN.length}`);
    console.log('');
    console.log(`${colors.cyan}💡 To verify these users, run:${colors.reset}`);
    console.log(`   ${colors.green}node bulk-verify-existing-users.js --execute${colors.reset}`);
    console.log('');

    return unverifiedUsers.length;

  } catch (error) {
    console.error(`${colors.red}❌ Error fetching users:${colors.reset}`, error.message);
    return -1;
  }
}

async function executeVerification() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.green}✅ EXECUTE: Bulk Verify Users${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    // First, show what we're about to verify
    const unverifiedUsers = await prisma.user.findMany({
      where: { isEmailVerified: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (unverifiedUsers.length === 0) {
      console.log(`${colors.green}✅ No unverified users found!${colors.reset}`);
      console.log('All users are already verified.\n');
      return;
    }

    console.log(`${colors.yellow}⚠️  About to verify ${unverifiedUsers.length} users...${colors.reset}\n`);

    // Safety confirmation
    console.log(`${colors.yellow}⏳ Starting in 3 seconds... Press Ctrl+C to cancel${colors.reset}\n`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`${colors.cyan}🔄 Processing verification...${colors.reset}\n`);

    // Verify all users
    const now = new Date();
    const result = await prisma.user.updateMany({
      where: { isEmailVerified: false },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: now
      }
    });

    console.log(`${colors.green}✅ Successfully verified ${result.count} users!${colors.reset}\n`);

    // Show verified users
    console.log(`${colors.cyan}📋 Verified Users:${colors.reset}`);
    unverifiedUsers.forEach((user, i) => {
      console.log(`  ${i + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });

    console.log('\n' + '─'.repeat(70));
    console.log(`${colors.green}🎉 Bulk verification complete!${colors.reset}`);
    console.log(`${colors.cyan}All ${result.count} users can now login without email verification.${colors.reset}\n`);

    // Verify the change
    const stillUnverified = await prisma.user.count({
      where: { isEmailVerified: false }
    });

    if (stillUnverified === 0) {
      console.log(`${colors.green}✅ Verification confirmed: All users are now verified!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Note: ${stillUnverified} users still unverified (may have registered during script execution)${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error during verification:${colors.reset}`, error.message);
    console.error(error);
  }
}

async function showStats() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}📊 USER VERIFICATION STATISTICS${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    const totalUsers = await prisma.user.count();
    const verifiedUsers = await prisma.user.count({
      where: { isEmailVerified: true }
    });
    const unverifiedUsers = await prisma.user.count({
      where: { isEmailVerified: false }
    });

    const verifiedPercent = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
    const unverifiedPercent = totalUsers > 0 ? Math.round((unverifiedUsers / totalUsers) * 100) : 0;

    console.log(`${colors.blue}Total Users:${colors.reset}        ${totalUsers}`);
    console.log(`${colors.green}Verified Users:${colors.reset}     ${verifiedUsers} (${verifiedPercent}%)`);
    console.log(`${colors.yellow}Unverified Users:${colors.reset}   ${unverifiedUsers} (${unverifiedPercent}%)`);
    console.log('');

    // Breakdown by role
    console.log(`${colors.cyan}Breakdown by Role:${colors.reset}`);
    
    const userStats = await prisma.user.groupBy({
      by: ['role', 'isEmailVerified'],
      _count: true
    });

    const roleBreakdown = {};
    userStats.forEach(stat => {
      if (!roleBreakdown[stat.role]) {
        roleBreakdown[stat.role] = { verified: 0, unverified: 0 };
      }
      if (stat.isEmailVerified) {
        roleBreakdown[stat.role].verified = stat._count;
      } else {
        roleBreakdown[stat.role].unverified = stat._count;
      }
    });

    for (const [role, stats] of Object.entries(roleBreakdown)) {
      const total = stats.verified + stats.unverified;
      console.log(`  ${role}s: ${total} total (${stats.verified} verified, ${stats.unverified} unverified)`);
    }

    console.log('');

  } catch (error) {
    console.error(`${colors.red}❌ Error fetching stats:${colors.reset}`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n' + '='.repeat(70));
  console.log(`${colors.green}👥 BULK USER VERIFICATION TOOL${colors.reset}`);
  console.log('='.repeat(70));

  try {
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to database${colors.reset}\n`);

    if (!command || command === '--help' || command === '-h') {
      // Show help
      console.log('Usage:');
      console.log(`  ${colors.cyan}node bulk-verify-existing-users.js --preview${colors.reset}   Preview unverified users`);
      console.log(`  ${colors.cyan}node bulk-verify-existing-users.js --execute${colors.reset}  Verify all unverified users`);
      console.log(`  ${colors.cyan}node bulk-verify-existing-users.js --stats${colors.reset}    Show verification statistics`);
      console.log(`  ${colors.cyan}node bulk-verify-existing-users.js --help${colors.reset}     Show this help message`);
      console.log('');
      console.log(`${colors.yellow}Recommended workflow:${colors.reset}`);
      console.log('  1. Run with --preview to see who will be verified');
      console.log('  2. Run with --execute to verify all users');
      console.log('  3. Run with --stats to confirm completion');
      console.log('');

    } else if (command === '--preview' || command === '-p') {
      await previewUnverifiedUsers();

    } else if (command === '--execute' || command === '-e') {
      await executeVerification();

    } else if (command === '--stats' || command === '-s') {
      await showStats();

    } else {
      console.log(`${colors.red}❌ Unknown command: ${command}${colors.reset}`);
      console.log(`${colors.cyan}Run with --help to see available commands${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Fatal error:${colors.reset}`, error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
    console.log('='.repeat(70) + '\n');
  }
}

main().catch(console.error);
