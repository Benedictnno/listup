# Email Verification Troubleshooting Guide

## Quick Diagnostic Checklist

Run through these steps to identify the issue:

### ✅ Step 1: Verify Database Migration

**Check if migration was applied:**

```cmd
cd c:\Users\ADMIN\Documents\listup\Backend
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
```

**If you see errors**, the schema has issues. Share the error message.

**Then push to database:**
```cmd
npx prisma db push
```

**Expected Output:**
```
Your database is now in sync with your Prisma schema.
```

---

### ✅ Step 2: Check Environment Variables

**Create `.env` file if it doesn't exist:**

Create a file at `c:\Users\ADMIN\Documents\listup\Backend\.env` with:

```env
# Database
DATABASE_URL="your_mongodb_connection_string_here"

# Email Service (Resend)
RESEND_API_KEY="your_resend_api_key_here"

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# Server Port
PORT=4000

# Node Environment
NODE_ENV=development
```

**⚠️ CRITICAL:** Replace the placeholder values with your actual credentials!

**To check if variables are loaded:**
Add this temporarily to `src/server.js` after line 1:

```javascript
require('dotenv').config();
console.log('🔍 Environment Check:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set (using default)');
```

---

### ✅ Step 3: Verify Backend is Running

**Start the server:**
```cmd
npm run dev
```

**Expected Output:**
```
✅ API running on http://localhost:4000
```

**If server won't start:**
- Check for port conflicts (another app using port 4000)
- Check for syntax errors in the code
- Share the error message

---

### ✅ Step 4: Test Registration Endpoint

**Test with curl or Postman:**

```bash
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"USER\"}"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "data": {
    "token": "jwt_token...",
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@example.com",
      "role": "USER",
      "isEmailVerified": false
    }
  }
}
```

**Check backend logs for:**
```
✅ Email verification sent to: test@example.com
📧 Message ID: ...
```

**If you see errors in logs:**
- `❌ Resend API Error` → Check RESEND_API_KEY
- `Failed to send verification email` → Email service issue
- `Prisma error` → Database connection issue

---

### ✅ Step 5: Check Database

**Verify user was created:**

Open MongoDB Compass or use MongoDB shell:

```javascript
// Check if user exists
db.User.findOne({ email: "test@example.com" })

// Check if verification token was created
db.EmailVerification.findOne({ userId: "user_id_here" })
```

**Expected:**
- User should have `isEmailVerified: false`
- EmailVerification record should exist with token and expiration

---

### ✅ Step 6: Test Login (Should Fail)

```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Please verify your email address to continue.",
  "requiresEmailVerification": true
}
```

**Status Code:** 403

**If login succeeds (200 OK):**
- Email verification check is not working
- User might already be verified
- Check the login controller code

---

### ✅ Step 7: Test Email Verification

**Get the token from database or email, then:**

```bash
curl "http://localhost:4000/api/auth/verify-email?token=YOUR_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

**Check database:**
- User should now have `isEmailVerified: true`
- EmailVerification record should have `verified: true`

---

### ✅ Step 8: Test Login After Verification

```bash
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token...",
    "user": {
      "isEmailVerified": true
    }
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "npx: command not found" or PowerShell Security Error

**Solution:**
Use Command Prompt (cmd) instead of PowerShell, or run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

### Issue 2: Email Not Sending

**Symptoms:**
- Registration succeeds but no email received
- Backend logs show email errors

**Solutions:**

1. **Check RESEND_API_KEY:**
   - Log in to https://resend.com
   - Get your API key from dashboard
   - Add to `.env` file

2. **Check Resend Account:**
   - Verify account is active
   - Check sending limits
   - Verify domain (if using custom domain)

3. **Check Email Logs:**
   Look for these in backend console:
   ```
   ❌ Resend API Error: ...
   ```

4. **Test Resend API directly:**
   ```javascript
   // Create test-email.js
   const { Resend } = require('resend');
   const resend = new Resend(process.env.RESEND_API_KEY);

   resend.emails.send({
     from: 'ListUp <onboarding@resend.dev>',
     to: 'your-email@example.com',
     subject: 'Test Email',
     html: '<h1>Test</h1>'
   }).then(console.log).catch(console.error);
   ```

---

### Issue 3: Verification Link Not Working

**Symptoms:**
- Click link in email → error or nothing happens

**Solutions:**

1. **Check FRONTEND_URL:**
   - Must match your frontend URL exactly
   - Default: `http://localhost:3000`
   - Update in `.env` if different

2. **Create Frontend Verification Page:**
   You need a page at `/verify-email` in your frontend that:
   - Gets token from URL query parameter
   - Calls backend API: `GET /api/auth/verify-email?token=...`
   - Shows success/error message

3. **Test Backend Endpoint Directly:**
   Copy the token from email and test:
   ```bash
   curl "http://localhost:4000/api/auth/verify-email?token=PASTE_TOKEN_HERE"
   ```

---

### Issue 4: Login Still Works for Unverified Users

**Symptoms:**
- Unverified users can login successfully

**Solutions:**

1. **Check if code changes were saved:**
   - Verify `src/controllers/auth.controller.js` has the updated login function
   - Restart backend server: `npm run dev`

2. **Check if user is already verified:**
   ```javascript
   // In MongoDB
   db.User.findOne({ email: "user@example.com" })
   // Check isEmailVerified field
   ```

3. **Clear old sessions/tokens:**
   - Frontend might be using old JWT token
   - Clear localStorage/cookies
   - Try with fresh registration

---

### Issue 5: Database Connection Error

**Symptoms:**
```
PrismaClientInitializationError: Can't reach database server
```

**Solutions:**

1. **Check DATABASE_URL:**
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
   - Verify credentials are correct
   - Check network connection

2. **Test MongoDB Connection:**
   ```javascript
   // test-db.js
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();

   prisma.user.count()
     .then(count => console.log('✅ Connected! Users:', count))
     .catch(err => console.error('❌ Connection failed:', err))
     .finally(() => prisma.$disconnect());
   ```

---

### Issue 6: Token Expired

**Symptoms:**
```json
{
  "message": "Verification token has expired. Please request a new one.",
  "expired": true
}
```

**Solution:**
Use the resend verification endpoint:

```bash
curl -X POST http://localhost:4000/api/auth/resend-verification ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\"}"
```

---

## Debug Mode

**Add detailed logging to track the flow:**

Add to `src/controllers/auth.controller.js` in the register function:

```javascript
console.log('🔍 Registration Debug:');
console.log('1. User created:', user.id);
console.log('2. Token generated:', verificationToken.substring(0, 10) + '...');
console.log('3. Verification record created');
console.log('4. Attempting to send email to:', user.email);
console.log('5. Frontend URL:', process.env.FRONTEND_URL);
console.log('6. Verification link:', verificationLink);
```

---

## Still Not Working?

**Provide these details:**

1. **What step are you on?**
   - Migration? Testing? Frontend integration?

2. **What's the exact error?**
   - Copy full error message from console
   - Include stack trace if available

3. **What have you tried?**
   - List the steps you've completed

4. **Backend logs:**
   - Copy relevant logs from terminal

5. **Environment:**
   - Node version: `node --version`
   - npm version: `npm --version`
   - OS: Windows version

6. **Database:**
   - MongoDB version
   - Connection type (local/Atlas)

---

## Quick Test Script

Create `test-email-verification.js`:

```javascript
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:4000/api/auth';
const TEST_EMAIL = `test${Date.now()}@example.com`;

async function test() {
  console.log('🧪 Testing Email Verification Flow\n');

  // 1. Register
  console.log('1️⃣ Registering user...');
  const registerRes = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: TEST_EMAIL,
      password: 'password123',
      role: 'USER'
    })
  });
  const registerData = await registerRes.json();
  console.log('   Status:', registerRes.status);
  console.log('   Response:', registerData);
  console.log('   isEmailVerified:', registerData.data?.user?.isEmailVerified);

  // 2. Try Login (should fail)
  console.log('\n2️⃣ Attempting login (should fail)...');
  const loginRes1 = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: 'password123'
    })
  });
  const loginData1 = await loginRes1.json();
  console.log('   Status:', loginRes1.status);
  console.log('   Response:', loginData1);
  console.log('   ✅ Login blocked:', loginRes1.status === 403);

  console.log('\n⚠️  Check your email for verification link!');
  console.log('   Or manually verify using the token from database');
}

test().catch(console.error);
```

Run: `node test-email-verification.js`
