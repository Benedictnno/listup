#!/usr/bin/env node

/**
 * Fix and Verify All Legacy Users
 * 
 * This script handles users who registered BEFORE the isEmailVerified field
 * was added to the schema. It will:
 * 1. Find all users with isEmailVerified = null or false
 * 2. Set them all to isEmailVerified = true
 * 3. Add emailVerifiedAt timestamp
 * 
 * Usage:
 *   node fix-and-verify-all-users.js --preview  (see affected users)
 *   node fix-and-verify-all-users.js --execute  (fix and verify them)
 */

require('dotenv').config();
const prisma = require('./src/lib/prisma');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

async function previewAffectedUsers() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}📋 PREVIEW: Users Needing Verification Fix${colors.reset}`);
  console.log(`${colors.cyan}(Includes users missing isEmailVerified field entirely)${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    // Find ALL users (to check the state of isEmailVerified field)
    // Note: Don't select 'role' to avoid enum validation issues with legacy lowercase data
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isEmailVerified: true,
        emailVerifiedAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`${colors.blue}Total users in database: ${allUsers.length}${colors.reset}\n`);

    // Categorize users
    const alreadyVerified = allUsers.filter(u => u.isEmailVerified === true);
    const needsVerification = allUsers.filter(u => u.isEmailVerified !== true); // false, null, or undefined

    console.log(`${colors.green}✅ Already Verified: ${alreadyVerified.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Need Verification: ${needsVerification.length}${colors.reset}\n`);

    if (needsVerification.length === 0) {
      console.log(`${colors.green}🎉 Great! All users are already verified!${colors.reset}\n`);
      return 0;
    }

    console.log('─'.repeat(70));
    console.log(`${colors.yellow}Users who will be verified:${colors.reset}\n`);

    // Group by verification status
    const nullValues = needsVerification.filter(u => u.isEmailVerified === null);
    const falseValues = needsVerification.filter(u => u.isEmailVerified === false);

    if (nullValues.length > 0) {
      console.log(`${colors.magenta}Users with NULL isEmailVerified (${nullValues.length}):${colors.reset}`);
      console.log(`${colors.cyan}(These likely registered before the field was added)${colors.reset}\n`);
      nullValues.slice(0, 10).forEach((user, i) => {
        const daysSince = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  ${i + 1}. ${user.email}`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Registered: ${user.createdAt.toISOString().split('T')[0]} (${daysSince} days ago)`);
        console.log(`     Status: ${colors.red}NULL${colors.reset} → Will be set to TRUE ✅`);
        console.log('');
      });
      if (nullValues.length > 10) {
        console.log(`     ... and ${nullValues.length - 10} more\n`);
      }
    }

    if (falseValues.length > 0) {
      console.log(`${colors.yellow}Users with FALSE isEmailVerified (${falseValues.length}):${colors.reset}\n`);
      falseValues.slice(0, 10).forEach((user, i) => {
        const daysSince = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24));
        console.log(`  ${i + 1}. ${user.email}`);
        console.log(`     Name: ${user.name}`);
        console.log(`     Registered: ${user.createdAt.toISOString().split('T')[0]} (${daysSince} days ago)`);
        console.log(`     Status: ${colors.yellow}FALSE${colors.reset} → Will be set to TRUE ✅`);
        console.log('');
      });
      if (falseValues.length > 10) {
        console.log(`     ... and ${falseValues.length - 10} more\n`);
      }
    }

    console.log('─'.repeat(70));
    console.log(`${colors.yellow}SUMMARY:${colors.reset}`);
    console.log(`  Total users to verify: ${needsVerification.length}`);
    console.log(`  - NULL values (legacy): ${nullValues.length}`);
    console.log(`  - FALSE values (recent): ${falseValues.length}`);
    console.log('');
    
    console.log(`${colors.cyan}💡 To verify these users, run:${colors.reset}`);
    console.log(`   ${colors.green}node fix-and-verify-all-users.js --execute${colors.reset}`);
    console.log('');

    return needsVerification.length;

  } catch (error) {
    console.error(`${colors.red}❌ Error fetching users:${colors.reset}`, error.message);
    return -1;
  }
}

async function executeVerification() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.green}✅ EXECUTE: Fix and Verify All Users${colors.reset}`);
  console.log(`${colors.cyan}(Will ADD isEmailVerified field if missing, then set to TRUE)${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    // Get all users who need verification
    // This catches users where isEmailVerified is:
    // - false
    // - null
    // - undefined (field doesn't exist in document)
    const needsVerification = await prisma.user.findMany({
      where: {
        NOT: {
          isEmailVerified: true
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        isEmailVerified: true
      }
    });

    if (needsVerification.length === 0) {
      console.log(`${colors.green}✅ No users need verification!${colors.reset}`);
      console.log('All users are already verified.\n');
      return;
    }

    console.log(`${colors.yellow}⚠️  About to verify ${needsVerification.length} users...${colors.reset}\n`);

    // Show breakdown
    const nullCount = needsVerification.filter(u => u.isEmailVerified === null).length;
    const falseCount = needsVerification.filter(u => u.isEmailVerified === false).length;
    
    console.log(`  - Users with NULL isEmailVerified: ${nullCount}`);
    console.log(`  - Users with FALSE isEmailVerified: ${falseCount}`);
    console.log('');

    // Safety confirmation
    console.log(`${colors.yellow}⏳ Starting in 3 seconds... Press Ctrl+C to cancel${colors.reset}\n`);
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log(`${colors.cyan}🔄 Processing verification...${colors.reset}\n`);

    const now = new Date();
    
    // Update users who are NOT verified
    // This catches:
    // 1. Users where isEmailVerified is false
    // 2. Users where isEmailVerified is null
    // 3. Users where the field doesn't exist at all (legacy users)
    // MongoDB will ADD the field if it doesn't exist, or UPDATE it if it does
    const result = await prisma.user.updateMany({
      where: {
        NOT: {
          isEmailVerified: true
        }
      },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: now
      }
    });

    console.log(`${colors.green}✅ Successfully verified ${result.count} users!${colors.reset}\n`);

    // Show sample of verified users
    console.log(`${colors.cyan}📋 Sample of Verified Users:${colors.reset}`);
    needsVerification.slice(0, 15).forEach((user, i) => {
      const status = user.isEmailVerified === null ? 'NULL' : 'FALSE';
      console.log(`  ${i + 1}. ${user.email} (${user.name}) [was: ${status}]`);
    });
    
    if (needsVerification.length > 15) {
      console.log(`  ... and ${needsVerification.length - 15} more`);
    }

    console.log('\n' + '─'.repeat(70));
    console.log(`${colors.green}🎉 Bulk verification complete!${colors.reset}`);
    console.log(`${colors.cyan}All ${result.count} users can now login without email verification.${colors.reset}\n`);

    // Verify the change
    const stillNeedVerification = await prisma.user.count({
      where: {
        NOT: {
          isEmailVerified: true
        }
      }
    });

    if (stillNeedVerification === 0) {
      console.log(`${colors.green}✅ Verification confirmed: All users are now verified!${colors.reset}\n`);
    } else {
      console.log(`${colors.yellow}⚠️  Note: ${stillNeedVerification} users still need verification${colors.reset}`);
      console.log(`${colors.cyan}(These may have registered during script execution)${colors.reset}\n`);
    }

  } catch (error) {
    console.error(`${colors.red}❌ Error during verification:${colors.reset}`, error.message);
    console.error(error);
  }
}

async function showDetailedStats() {
  console.log('\n' + '='.repeat(70));
  console.log(`${colors.cyan}📊 DETAILED VERIFICATION STATISTICS${colors.reset}`);
  console.log('='.repeat(70) + '\n');

  try {
    const totalUsers = await prisma.user.count();
    
    const verifiedTrue = await prisma.user.count({
      where: { isEmailVerified: true }
    });
    
    const notVerified = await prisma.user.count({
      where: {
        NOT: { isEmailVerified: true }
      }
    });

    console.log(`${colors.blue}Total Users:${colors.reset}           ${totalUsers}`);
    console.log(`${colors.green}Verified (TRUE):${colors.reset}       ${verifiedTrue} (${Math.round(verifiedTrue/totalUsers*100)}%)`);
    console.log(`${colors.yellow}Not Verified:${colors.reset}          ${notVerified} (${Math.round(notVerified/totalUsers*100)}%)`);
    console.log(`${colors.cyan}(includes FALSE, NULL, and undefined)${colors.reset}`);
    console.log('');

    if (notVerified > 0) {
      console.log(`${colors.magenta}⚠️  WARNING: ${notVerified} users are not verified${colors.reset}`);
      console.log(`${colors.cyan}These likely have NULL, FALSE, or undefined isEmailVerified.${colors.reset}`);
      console.log(`${colors.cyan}Run with --execute to fix and verify them.${colors.reset}\n`);
    }

    // Note: Role breakdown skipped to avoid enum validation issues with legacy lowercase data

  } catch (error) {
    console.error(`${colors.red}❌ Error fetching stats:${colors.reset}`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('\n' + '='.repeat(70));
  console.log(`${colors.green}🔧 FIX & VERIFY ALL USERS TOOL${colors.reset}`);
  console.log(`${colors.cyan}Handles legacy users with NULL isEmailVerified${colors.reset}`);
  console.log('='.repeat(70));

  try {
    await prisma.$connect();
    console.log(`${colors.green}✅ Connected to database${colors.reset}\n`);

    if (!command || command === '--help' || command === '-h') {
      console.log('Usage:');
      console.log(`  ${colors.cyan}node fix-and-verify-all-users.js --preview${colors.reset}   Preview users needing fix`);
      console.log(`  ${colors.cyan}node fix-and-verify-all-users.js --execute${colors.reset}  Fix and verify all users`);
      console.log(`  ${colors.cyan}node fix-and-verify-all-users.js --stats${colors.reset}    Show detailed statistics`);
      console.log(`  ${colors.cyan}node fix-and-verify-all-users.js --help${colors.reset}     Show this help message`);
      console.log('');
      console.log(`${colors.yellow}What this script does:${colors.reset}`);
      console.log('  • Finds users where isEmailVerified is NOT true');
      console.log('  • This includes users missing the field entirely (legacy)');
      console.log('  • ADDS the isEmailVerified field if missing');
      console.log('  • Sets isEmailVerified to TRUE');
      console.log('  • Adds emailVerifiedAt timestamp');
      console.log('  • Allows all legacy users to login immediately');
      console.log('');
      console.log(`${colors.yellow}Recommended workflow:${colors.reset}`);
      console.log('  1. Run with --stats to see current state');
      console.log('  2. Run with --preview to see who will be affected');
      console.log('  3. Run with --execute to fix and verify all users');
      console.log('');

    } else if (command === '--preview' || command === '-p') {
      await previewAffectedUsers();

    } else if (command === '--execute' || command === '-e') {
      await executeVerification();

    } else if (command === '--stats' || command === '-s') {
      await showDetailedStats();

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
