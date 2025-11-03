# Email Verification - Quick Start Guide

## Step 1: Fix PowerShell Execution Policy

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Or use Command Prompt (cmd) instead of PowerShell for all commands below.

## Step 2: Apply Database Changes

```bash
cd c:\Users\ADMIN\Documents\listup\Backend

# Generate Prisma Client with new schema
npx prisma generate

# Push schema changes to MongoDB
npx prisma db push
```

## Step 3: (Optional) Verify Existing Users

If you want to grandfather existing users (mark them as verified):

```bash
node scripts/verify-existing-users.js
```

## Step 4: Restart Backend Server

```bash
npm run dev
```

## Step 5: Test the Implementation

### Test 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"USER\"}"
```

Expected: User created, verification email sent

### Test 2: Try to Login (Should Fail)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Expected: 403 error with message "Please verify your email address to continue."

### Test 3: Resend Verification Email
```bash
curl -X POST http://localhost:5000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\"}"
```

Expected: Success message

### Test 4: Verify Email
Check your email inbox for the verification link, or manually call:
```bash
curl "http://localhost:5000/api/auth/verify-email?token=YOUR_TOKEN_HERE"
```

Expected: Success message

### Test 5: Login After Verification
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
```

Expected: Login successful with JWT token

## Environment Variables Required

Make sure your `.env` file has:

```env
DATABASE_URL="your_mongodb_connection_string"
RESEND_API_KEY="your_resend_api_key"
FRONTEND_URL="http://localhost:3000"
```

## New API Endpoints

1. **GET** `/api/auth/verify-email?token=<token>` - Verify email
2. **POST** `/api/auth/resend-verification` - Resend verification email

## What Changed

- ✅ Users must verify email before login
- ✅ Verification email sent on registration
- ✅ Can resend verification email
- ✅ Tokens expire after 24 hours
- ✅ Login blocked for unverified users

## Troubleshooting

**Problem**: PowerShell won't run npm/npx
**Solution**: Use Command Prompt (cmd) or run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

**Problem**: Email not sending
**Solution**: Check RESEND_API_KEY in .env file

**Problem**: Can't find verification token
**Solution**: Check email spam folder or check backend logs

**Problem**: Existing users can't login
**Solution**: Run the verify-existing-users.js script

## Next Steps

1. Update frontend to handle email verification flow
2. Create verification email notice page
3. Add resend verification button on login page
4. Test with real email addresses
5. Update production environment variables

For detailed documentation, see `EMAIL_VERIFICATION_SETUP.md`
