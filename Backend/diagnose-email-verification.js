#!/usr/bin/env node

/**
 * Email Verification Diagnostic Script
 * 
 * This script checks your email verification setup and identifies issues.
 * Run this on your production server to diagnose why emails aren't working.
 */

require('dotenv').config();
const { Resend } = require('resend');
const prisma = require('./src/lib/prisma');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  const prefix = {
    error: `${colors.red}❌ ERROR${colors.reset}`,
    success: `${colors.green}✅ SUCCESS${colors.reset}`,
    warning: `${colors.yellow}⚠️  WARNING${colors.reset}`,
    info: `${colors.blue}ℹ️  INFO${colors.reset}`
  };
  console.log(`[${timestamp}] ${prefix[type]} ${message}`);
}

async function checkEnvironmentVariables() {
  log('info', 'Checking environment variables...');
  
  const requiredVars = {
    'DATABASE_URL': process.env.DATABASE_URL,
    'RESEND_API_KEY': process.env.RESEND_API_KEY,
    'FRONTEND_URL': process.env.FRONTEND_URL,
    'NODE_ENV': process.env.NODE_ENV,
    'PORT': process.env.PORT
  };

  let allPresent = true;
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      log('error', `${key} is NOT SET`);
      allPresent = false;
    } else {
      // Mask sensitive values
      const displayValue = key.includes('KEY') || key.includes('URL') 
        ? value.substring(0, 10) + '...' 
        : value;
      log('success', `${key} = ${displayValue}`);
    }
  }

  // Check NODE_ENV specifically
  if (process.env.NODE_ENV !== 'production') {
    log('warning', `NODE_ENV is "${process.env.NODE_ENV}" - emails will be redirected to benedictnnaoma0@gmail.com`);
    log('warning', 'For production, set NODE_ENV=production in .env file');
  } else {
    log('success', 'NODE_ENV is set to production');
  }

  return allPresent;
}

async function checkDatabaseConnection() {
  log('info', 'Testing database connection...');
  
  try {
    await prisma.$connect();
    log('success', 'Connected to MongoDB database');

    // Check if User model has email verification fields
    const userCount = await prisma.user.count();
    log('info', `Found ${userCount} users in database`);

    const unverifiedCount = await prisma.user.count({
      where: { isEmailVerified: false }
    });
    log('info', `${unverifiedCount} users are unverified`);

    // Check EmailVerification records
    const tokenCount = await prisma.emailVerification.count();
    log('info', `Found ${tokenCount} verification tokens in database`);

    // Check recent tokens
    const recentTokens = await prisma.emailVerification.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, isEmailVerified: true } } }
    });

    if (recentTokens.length > 0) {
      log('info', 'Recent verification tokens:');
      recentTokens.forEach((token, i) => {
        const expired = new Date() > token.expiresAt;
        const status = token.verified ? 'USED' : expired ? 'EXPIRED' : 'ACTIVE';
        console.log(`  ${i + 1}. Email: ${token.user.email} | Status: ${status} | Verified User: ${token.user.isEmailVerified}`);
      });
    }

    return true;
  } catch (error) {
    log('error', `Database connection failed: ${error.message}`);
    return false;
  }
}

async function checkResendAPI() {
  log('info', 'Testing Resend API connection...');

  if (!process.env.RESEND_API_KEY) {
    log('error', 'RESEND_API_KEY is not set - cannot test email service');
    return false;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    log('info', 'Resend API initialized');
    log('warning', 'To fully test, we need to send a test email');
    
    // Check if using sandbox
    const isSandbox = true; // onboarding@resend.dev is sandbox
    if (isSandbox) {
      log('warning', 'Currently using Resend sandbox (onboarding@resend.dev)');
      log('warning', 'In production, you should verify your domain and use: noreply@yourdomain.com');
      log('info', 'Visit: https://resend.com/domains to verify your domain');
    }

    return true;
  } catch (error) {
    log('error', `Resend API test failed: ${error.message}`);
    return false;
  }
}

async function sendTestEmail(testEmail) {
  log('info', `Sending test email to: ${testEmail}`);

  if (!process.env.RESEND_API_KEY) {
    log('error', 'Cannot send test email - RESEND_API_KEY not set');
    return false;
  }

  try {
    const { sendEmailVerification } = require('./src/lib/email');
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const testToken = 'test-token-' + Date.now();
    const testLink = `${frontendUrl}/verify-email?token=${testToken}`;

    await sendEmailVerification(testEmail, testLink, 'Test User');
    log('success', `Test email sent successfully to ${testEmail}`);
    log('info', `Check your inbox for the verification email`);
    return true;
  } catch (error) {
    log('error', `Failed to send test email: ${error.message}`);
    if (error.message.includes('Invalid email')) {
      log('warning', 'This might be because the email is not verified in Resend sandbox');
      log('info', 'Try with: benedictnnaoma0@gmail.com (verified in sandbox)');
    }
    return false;
  }
}

async function analyzeIssues() {
  log('info', 'Analyzing common issues...');

  const issues = [];

  // Check if using development settings in production
  if (process.env.NODE_ENV !== 'production') {
    issues.push({
      severity: 'HIGH',
      issue: 'NODE_ENV is not set to "production"',
      impact: 'All emails are being redirected to benedictnnaoma0@gmail.com',
      solution: 'Set NODE_ENV=production in your .env file'
    });
  }

  // Check frontend URL
  if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('localhost')) {
    issues.push({
      severity: 'HIGH',
      issue: 'FRONTEND_URL points to localhost or is not set',
      impact: 'Verification links will be incorrect in production',
      solution: 'Set FRONTEND_URL=https://yourdomain.com in .env file'
    });
  }

  // Check if many unverified users
  const unverifiedCount = await prisma.user.count({ where: { isEmailVerified: false } });
  const totalUsers = await prisma.user.count();
  if (unverifiedCount > totalUsers * 0.5 && totalUsers > 10) {
    issues.push({
      severity: 'MEDIUM',
      issue: `${unverifiedCount} out of ${totalUsers} users are unverified (${Math.round(unverifiedCount/totalUsers*100)}%)`,
      impact: 'Many users cannot login - email delivery is likely failing',
      solution: 'Fix email configuration and consider manually verifying existing users'
    });
  }

  if (issues.length === 0) {
    log('success', 'No obvious configuration issues found!');
  } else {
    log('warning', `Found ${issues.length} potential issue(s):`);
    issues.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.severity}] ${issue.issue}`);
      console.log(`   Impact: ${issue.impact}`);
      console.log(`   Solution: ${issue.solution}`);
    });
  }
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📧 EMAIL VERIFICATION DIAGNOSTIC TOOL');
  console.log('='.repeat(70) + '\n');

  const checks = {
    env: false,
    db: false,
    resend: false
  };

  try {
    // Step 1: Environment variables
    console.log('\n📋 STEP 1: Environment Variables');
    console.log('-'.repeat(70));
    checks.env = await checkEnvironmentVariables();

    // Step 2: Database
    console.log('\n💾 STEP 2: Database Connection');
    console.log('-'.repeat(70));
    checks.db = await checkDatabaseConnection();

    // Step 3: Resend API
    console.log('\n📧 STEP 3: Email Service (Resend)');
    console.log('-'.repeat(70));
    checks.resend = await checkResendAPI();

    // Step 4: Analysis
    console.log('\n🔍 STEP 4: Issue Analysis');
    console.log('-'.repeat(70));
    await analyzeIssues();

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`Environment Variables: ${checks.env ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
    console.log(`Database Connection:   ${checks.db ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);
    console.log(`Email Service:         ${checks.resend ? colors.green + 'PASS' : colors.red + 'FAIL'}${colors.reset}`);

    // Optional: Send test email
    console.log('\n💡 TIP: Want to send a test verification email?');
    console.log('   Run: node diagnose-email-verification.js test youremail@example.com');

  } catch (error) {
    log('error', `Diagnostic failed: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Check if test email argument provided
const args = process.argv.slice(2);
if (args[0] === 'test' && args[1]) {
  (async () => {
    await sendTestEmail(args[1]);
    await prisma.$disconnect();
    process.exit(0);
  })();
} else {
  main().catch(console.error);
}
