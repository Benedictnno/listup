# 📧 Email Setup Guide for ListUp

## 🚀 **Why Nodemailer + Mailtrap?**

- **Flexible**: Works with ANY email service
- **Professional Testing**: Mailtrap catches emails before users see them
- **No Vendor Lock-in**: Easy to switch providers
- **Cost Effective**: Much cheaper than SendGrid/Mailgun
- **Spam Testing**: Ensure emails don't go to spam folders

---

## 🔧 **Installation**

```bash
npm install nodemailer
```

---

## 📧 **Setup Options (Ranked by Recommendation)**

### **🥇 Option 1: Mailtrap (Development/Testing - RECOMMENDED)**

Perfect for testing emails before they reach real users.

#### **Step 1: Create Mailtrap Account**
1. Go to [Mailtrap.io](https://mailtrap.io)
2. Sign up for free account
3. Create a new project called "ListUp"

#### **Step 2: Get SMTP Credentials**
1. Go to your project inbox
2. Click **Show Credentials**
3. Copy the SMTP settings

#### **Step 3: Environment Variables**
Add to your `.env` file:

```bash
# Mailtrap Configuration (Development/Testing)
EMAIL_SERVICE="mailtrap"
MAILTRAP_HOST="smtp.mailtrap.io"
MAILTRAP_PORT="2525"
MAILTRAP_USER="your-mailtrap-username"
MAILTRAP_PASS="your-mailtrap-password"
MAILTRAP_INBOX_URL="https://mailtrap.io/inboxes/your-inbox-id"
```

#### **Step 4: Benefits**
- ✅ **No real emails sent** - Perfect for testing
- ✅ **Spam testing** - Check deliverability
- ✅ **Email analytics** - Track open rates
- ✅ **Team collaboration** - Share inbox with team
- ✅ **Professional testing** - Before going live

---

### **🥈 Option 2: Gmail SMTP (Development - FREE)**

Good for development if you prefer Gmail.

#### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Step Verification

#### **Step 2: Generate App Password**
1. Go to **Security** → **2-Step Verification**
2. Click **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Enter "ListUp" and click **Generate**
5. Copy the 16-character password

#### **Step 3: Environment Variables**
```bash
# Gmail Configuration (Development)
EMAIL_SERVICE="gmail"
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"
```

---

### **🥉 Option 3: Custom Domain SMTP (Production)**

Use your `listup.ng` domain email for production.

#### **Step 1: Get SMTP Details**
From your hosting provider (cPanel, etc.):
- SMTP Host: `mail.listup.ng` or `smtp.listup.ng`
- Port: `587` (TLS) or `465` (SSL)
- Username: `noreply@listup.ng`
- Password: Your email password

#### **Step 2: Environment Variables**
```bash
# Custom Domain SMTP (Production)
EMAIL_SERVICE="production"
NODE_ENV="production"
SMTP_HOST="mail.listup.ng"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="noreply@listup.ng"
SMTP_PASS="your-email-password"
```

---

## 🧪 **Testing with Mailtrap**

### **Test Email Service**
```javascript
const emailService = require('./src/lib/email');

// Test configuration
await emailService.verifyEmailConfig();

// Test sending
await emailService.testEmailService();
```

### **Test Password Reset**
```javascript
// Test password reset email
await emailService.sendPasswordResetCode('test@example.com', '123456', 'Test User');
```

### **Check Mailtrap Inbox**
1. Go to your Mailtrap project
2. Click on your inbox
3. See all sent emails
4. Test email rendering
5. Check spam score

---

## 🔒 **Security Best Practices**

### **Mailtrap Security**
- ✅ **No real emails sent** - Safe for testing
- ✅ **Private inboxes** - Only your team sees emails
- ✅ **No data retention** - Emails are temporary
- ✅ **Secure SMTP** - Encrypted connections

### **Environment Variables**
- ✅ Store all credentials in `.env`
- ✅ Add `.env` to `.gitignore`
- ✅ Use different credentials for dev/prod

### **Rate Limiting**
- ✅ Implement rate limiting on password reset
- ✅ Limit verification code attempts
- ✅ Monitor for abuse

---

## 📊 **Monitoring & Debugging**

### **Console Logs**
```
✅ Email service configuration verified
📧 Using Mailtrap for email testing
✅ Password reset email sent to: user@example.com
📧 Message ID: <abc123@mailtrap.io>
🔍 Check Mailtrap inbox: https://mailtrap.io/inboxes/your-inbox-id
```

### **Mailtrap Dashboard**
- 📧 **Inbox View**: See all emails
- 📊 **Analytics**: Open rates, click rates
- 🚫 **Spam Testing**: Check spam score
- 🔍 **Email Preview**: Test on different clients

---

## 🚨 **Troubleshooting**

### **Mailtrap Issues**

#### **"Authentication Failed"**
- ✅ Check Mailtrap credentials
- ✅ Verify inbox is active
- ✅ Check project permissions

#### **"Connection Refused"**
- ✅ Verify host: `smtp.mailtrap.io`
- ✅ Check port: `2525`
- ✅ Ensure firewall allows connection

### **Common Error Codes**
- `EAUTH`: Authentication failed
- `ECONNECTION`: Connection failed
- `ETIMEDOUT`: Connection timeout

---

## 📱 **Production Deployment**

### **Development → Production Flow**
1. **Start**: Mailtrap (testing)
2. **Test**: Custom domain SMTP
3. **Deploy**: Production domain SMTP
4. **Monitor**: Use Mailtrap for ongoing testing

### **Environment Variables**
```bash
# Development (Mailtrap)
EMAIL_SERVICE="mailtrap"
MAILTRAP_HOST="smtp.mailtrap.io"
MAILTRAP_USER="your-username"
MAILTRAP_PASS="your-password"

# Production (Custom Domain)
EMAIL_SERVICE="production"
SMTP_HOST="mail.listup.ng"
SMTP_USER="noreply@listup.ng"
SMTP_PASS="your-production-password"
```

---

## 💰 **Cost Comparison**

| Service | Setup Cost | Monthly Cost | Emails/Month | Best For |
|---------|------------|--------------|--------------|----------|
| **Mailtrap** | Free | $9.99 | 1,000 | **Testing** |
| **Gmail** | Free | Free | 500/day | Development |
| **Custom Domain** | $5-20/year | Free | Unlimited | Production |
| **SendGrid** | Free | $14.95 | 50k | High Volume |
| **Mailgun** | Free | $35 | 50k | Enterprise |

**Recommendation**: Start with Mailtrap (dev) + Custom Domain (prod)

---

## 🔄 **Migration Path**

### **Testing → Production**
1. **Development**: Use Mailtrap for all email testing
2. **Staging**: Test with custom domain SMTP
3. **Production**: Deploy with custom domain SMTP
4. **Ongoing**: Use Mailtrap for testing new features

### **Easy Provider Switching**
```bash
# Switch from Mailtrap to Production
EMAIL_SERVICE="production"
SMTP_HOST="mail.listup.ng"
# Remove MAILTRAP_* variables
```

---

## 📚 **Additional Resources**

- [Mailtrap Documentation](https://mailtrap.io/docs/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SMTP Ports Guide](https://www.arclab.com/en/kb/email/list-of-smtp-and-pop3-servers-mailserver-list.html)
- [Email Authentication (SPF, DKIM, DMARC)](https://dmarc.org/)

---

## ✅ **Quick Start Checklist**

- [ ] Install Nodemailer: `npm install nodemailer`
- [ ] Create Mailtrap account (recommended)
- [ ] Set up Mailtrap inbox and get credentials
- [ ] Configure environment variables
- [ ] Test email service: `verifyEmailConfig()`
- [ ] Test sending: `testEmailService()`
- [ ] Test password reset flow
- [ ] Check Mailtrap inbox for emails
- [ ] Set up production SMTP (when ready)
- [ ] Configure domain authentication (SPF, DKIM, DMARC)

---

## 🎯 **Why Mailtrap is Perfect for ListUp**

### **Before Going Live**
- ✅ Test password reset emails
- ✅ Verify email templates look professional
- ✅ Check spam score and deliverability
- ✅ Test on different email clients
- ✅ Ensure team can review emails

### **After Going Live**
- ✅ Test new email features
- ✅ Monitor email quality
- ✅ Debug email issues
- ✅ A/B test email content
- ✅ Train support team

**You're all set for professional email testing! 🎉**
