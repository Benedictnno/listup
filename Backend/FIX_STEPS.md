# Fix Email Verification Issues

## Problem
1. ❌ Verification emails not being sent
2. ❌ Users can login without email verification

## Root Cause
The database schema hasn't been updated yet. The `isEmailVerified` field and `EmailVerification` model don't exist in your database.

---

## Solution: Follow These Steps Exactly

### Step 1: Check Current Database State

```cmd
cd c:\Users\ADMIN\Documents\listup\Backend
node check-database.js
```

**If you see errors about missing fields/models**, continue to Step 2.

---

### Step 2: Apply Database Migration

**Open Command Prompt (NOT PowerShell)** and run:

```cmd
cd c:\Users\ADMIN\Documents\listup\Backend

REM Generate Prisma Client
npx prisma generate

REM Push schema to database
npx prisma db push
```

**Expected Output:**
```
✔ Generated Prisma Client
...
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

---

### Step 3: Verify Database Update

```cmd
node check-database.js
```

**Expected Output:**
```
✅ Connected! Found X users
✅ isEmailVerified field EXISTS
✅ EmailVerification model EXISTS
✅ RESEND_API_KEY is set
✅ FRONTEND_URL is set
```

---

### Step 4: Handle Existing Users (Optional)

If you have existing users, they will have `isEmailVerified = false` and won't be able to login.

**Option A: Mark all existing users as verified**
```cmd
node scripts/verify-existing-users.js
```

**Option B: Manually verify specific users in MongoDB:**
```javascript
db.User.updateMany(
  { isEmailVerified: { $exists: false } },
  { $set: { isEmailVerified: true, emailVerifiedAt: new Date() } }
)
```

---

### Step 5: Restart Backend Server

```cmd
npm run dev
```

**Check the logs for:**
```
✅ API running on http://localhost:4000
```

---

### Step 6: Test Registration

**Using curl (in Command Prompt):**
```cmd
curl -X POST http://localhost:4000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"USER\"}"
```

**Or using Postman:**
- Method: POST
- URL: http://localhost:4000/api/auth/register
- Body (JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "isEmailVerified": false
    }
  }
}
```

**Check Backend Logs:**
You should see:
```
✅ Email verification sent to: test@example.com
📧 Message ID: ...
```

**If you DON'T see email logs:**
- Check if RESEND_API_KEY is set in .env
- Check for error messages in logs
- Verify Resend API key is valid

---

### Step 7: Test Login Block

**Try to login with unverified user:**
```cmd
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Please verify your email address to continue.",
  "requiresEmailVerification": true
}
```

**If login succeeds (200 OK):**
- The user might already be verified
- Check database: `db.User.findOne({ email: "test@example.com" })`
- Verify migration was applied correctly

---

### Step 8: Get Verification Token

**From MongoDB:**
```javascript
db.EmailVerification.findOne({ userId: "user_id_here" })
```

Copy the `token` value.

---

### Step 9: Test Email Verification

```cmd
curl "http://localhost:4000/api/auth/verify-email?token=PASTE_TOKEN_HERE"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

---

### Step 10: Test Login After Verification

```cmd
curl -X POST http://localhost:4000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

**Expected Response (200 OK):**
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

## Common Issues After Migration

### Issue: "Cannot find module '@prisma/client'"

**Solution:**
```cmd
npm install @prisma/client
npx prisma generate
```

---

### Issue: Email not sending but no errors

**Check these:**

1. **RESEND_API_KEY in .env:**
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   ```

2. **Test Resend API directly:**
   Create `test-resend.js`:
   ```javascript
   require('dotenv').config();
   const { Resend } = require('resend');
   const resend = new Resend(process.env.RESEND_API_KEY);

   resend.emails.send({
     from: 'ListUp <onboarding@resend.dev>',
     to: 'your-email@example.com',
     subject: 'Test',
     html: '<h1>Test Email</h1>'
   })
   .then(data => console.log('✅ Email sent:', data))
   .catch(error => console.error('❌ Error:', error));
   ```

   Run: `node test-resend.js`

3. **Check Resend dashboard:**
   - Login to https://resend.com
   - Check "Logs" section
   - Verify API key is active

---

### Issue: Users still can login without verification

**Possible causes:**

1. **Migration not applied:**
   - Run `node check-database.js` to verify
   - If fields missing, run `npx prisma db push` again

2. **User already verified:**
   - Check in MongoDB: `db.User.findOne({ email: "..." })`
   - Look at `isEmailVerified` field

3. **Old code running:**
   - Restart backend server
   - Clear any caches
   - Verify you're testing the right endpoint

4. **Database has old schema:**
   - The field might not exist yet
   - Check with: `db.User.findOne({}).pretty()`
   - Should show `isEmailVerified` field

---

## Verification Checklist

After completing all steps, verify:

- [x] `npx prisma generate` runs without errors
- [x] `npx prisma db push` completes successfully
- [x] `node check-database.js` shows all green checkmarks
- [x] Backend server starts without errors
- [x] Registration creates user with `isEmailVerified: false`
- [x] Backend logs show "Email verification sent to..."
- [x] Login is blocked for unverified users (403 status)
- [x] Verification endpoint works
- [x] Login succeeds after verification

---

## Still Having Issues?

Run this comprehensive diagnostic:

```cmd
REM 1. Check Prisma
npx prisma --version

REM 2. Check database state
node check-database.js

REM 3. Check if backend is running
curl http://localhost:4000/api

REM 4. Check environment variables
type .env
```

Then share:
1. Output from `node check-database.js`
2. Backend server logs
3. Any error messages you see
