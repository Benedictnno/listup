# 🚨 Quick Fix Guide - Email Verification Issues

## TL;DR - Most Likely Problem

**Your `.env` file is missing or incorrectly configured in production.**

---

## 🎯 Quick Fix (5 Minutes)

### Step 1: Check Your Production Server

SSH into your production server:
```bash
cd /path/to/your/Backend
ls -la | grep .env
```

### Step 2: If `.env` is Missing, Create It

```bash
cp .env.template .env
nano .env  # or vim, or any editor
```

### Step 3: Fill In These Values

```env
DATABASE_URL="mongodb+srv://your-actual-connection-string"
RESEND_API_KEY="re_your_actual_api_key"
FRONTEND_URL="https://yourdomain.com"
NODE_ENV=production
PORT=4000
```

**⚠️ CRITICAL:** Make sure `NODE_ENV=production` (without quotes)!

### Step 4: Restart Your Backend

```bash
# If using PM2
pm2 restart backend

# If using systemd
sudo systemctl restart your-backend-service

# If running directly
# Stop current process and restart
node src/server.js
```

### Step 5: Test It

```bash
cd Backend
node diagnose-email-verification.js
```

This will tell you exactly what's wrong!

---

## 🔍 Run Diagnostics

I've created a diagnostic script for you. On your server:

```bash
cd Backend
node diagnose-email-verification.js
```

This will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ Email service configuration
- ✅ Common issues

**To send a test email:**
```bash
node diagnose-email-verification.js test your-email@example.com
```

---

## 🆘 Temporary Workaround

If users are stuck and can't login, you can manually verify them:

### Verify a Specific User
```bash
cd Backend
node manually-verify-user.js user@example.com
```

### List All Unverified Users
```bash
node manually-verify-user.js --list
```

### Verify All Users (Emergency Only!)
```bash
node manually-verify-user.js --all
```

⚠️ **Warning:** Only use `--all` if you're sure email is completely broken and need to let everyone in.

---

## 📋 Checklist

Go through this checklist on your production server:

- [ ] `.env` file exists in Backend directory
- [ ] `RESEND_API_KEY` is set and valid
- [ ] `DATABASE_URL` is set and correct
- [ ] `FRONTEND_URL` points to your production domain (not localhost)
- [ ] `NODE_ENV=production` (exactly, no quotes)
- [ ] Backend server has been restarted after changing .env
- [ ] Run diagnostic script: `node diagnose-email-verification.js`
- [ ] Send test email to yourself
- [ ] Test full flow: Register → Email → Verify → Login

---

## 🔧 Common Issues & Fixes

### Issue: "Emails not being received"

**Most likely cause:** `NODE_ENV` is not set to `"production"`

**Fix:**
```bash
# In .env file
NODE_ENV=production  # No quotes!

# Restart backend
pm2 restart backend
```

---

### Issue: "Email says 'onboarding@resend.dev'"

**Cause:** Using Resend sandbox (only works with verified emails)

**Fix:** Verify your domain on Resend
1. Go to https://resend.com/domains
2. Add your domain (e.g., `listup.ng`)
3. Add DNS records
4. Update `src/lib/email.js`:
   ```javascript
   from: 'ListUp <noreply@listup.ng>'
   ```

---

### Issue: "Network error when clicking verification link"

**Cause:** Frontend can't reach backend API

**Fix:** Set `NEXT_PUBLIC_API_URL` in frontend:
```bash
# In listup_frontend/.env.local or .env.production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

Then rebuild frontend:
```bash
cd listup_frontend
npm run build
```

---

### Issue: "Token invalid or expired"

**Possible causes:**
1. Token actually expired (24 hours)
2. Database connection issues
3. Token not saved properly

**Fix:** Have user request new verification email:
- Go to `/resend-verification`
- Enter email
- Click "Send Verification Email"

---

## 📞 Still Not Working?

Run the diagnostic script and send me the output:
```bash
node diagnose-email-verification.js > diagnostic-output.txt
cat diagnostic-output.txt
```

Check your email service logs:
- Resend Dashboard: https://resend.com/emails
- Look for failed email attempts
- Check error messages

Check backend logs:
```bash
pm2 logs backend --lines 100
# Look for email-related errors
```

---

## 📚 Full Documentation

For complete details, see:
- `EMAIL_VERIFICATION_ANALYSIS.md` - Comprehensive analysis of the issue
- `EMAIL_VERIFICATION_COMPLETE.md` - Original implementation docs
- `EMAIL_SETUP.md` - Email service setup guide

---

## ⚡ Emergency Contacts

If this is blocking users from logging in:

1. **Immediate:** Run `node manually-verify-user.js --all` to let everyone in
2. **Fix environment** variables as described above
3. **Test thoroughly** before declaring it fixed
4. **Monitor** for a few days to ensure it stays working

---

**Good luck! 🚀**
