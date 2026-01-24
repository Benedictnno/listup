const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY
const resend = new Resend(RESEND_API_KEY);

// ==========================
// Email Templates
// ==========================
const EMAIL_TEMPLATES = {
  PASSWORD_RESET: {
    subject: 'Reset Your ListUp Password',
    html: (code, userName) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; color: #333; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: auto; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: #84cc16; margin-bottom: 20px; }
          .code { font-size: 32px; font-weight: bold; color: #84cc16; background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; letter-spacing: 4px; }
          .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ListUp</div>
          <h1>Reset Your Password</h1>
          <p>Hi ${userName || 'there'},</p>
          <p>We received a request to reset your password for your ListUp account. Use the verification code below:</p>
          <div class="code">${code}</div>
          <p><strong>This code expires in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          <div class="footer">This is an automated message from ListUp. Please do not reply.</div>
        </div>
      </body>
      </html>
    `,
    text: (code, userName) => `
Reset Your ListUp Password

Hi ${userName || 'there'},

Use the verification code below to reset your password:

${code}

This code will expire in 10 minutes.

If you didn't request this, please ignore this email.

- ListUp Support
    `
  },
  EMAIL_VERIFICATION: {
    subject: 'Verify Your ListUp Email Address',
    html: (verificationLink, userName) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; color: #333; padding: 20px; }
          .container { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px; margin: auto; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; color: #84cc16; margin-bottom: 20px; }
          .button { display: inline-block; background: #84cc16; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 30px 0; }
          .button:hover { background: #65a30d; }
          .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; padding-top: 20px; }
          .link { color: #84cc16; word-break: break-all; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ListUp</div>
          <h1>Welcome to ListUp! 🎉</h1>
          <p>Hi ${userName || 'there'},</p>
          <p>Thank you for signing up! To complete your registration and access all features, please verify your email address by clicking the button below:</p>
          <a href="${verificationLink}" class="button">Verify Email Address</a>
          
          <!-- WhatsApp Click-to-Chat Section -->
          <div style="background: #ecfccb; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px solid #d9f99d;">
            <h3 style="color: #3f6212; margin-top: 0;">Stay Updated on WhatsApp! 📱</h3>
            <p style="color: #4d7c0f; margin-bottom: 20px;">Get real-time updates on your orders and exclusive offers.</p>
            <a href="https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER?.replace('whatsapp:', '') || '2349160000000'}?text=START" style="display: inline-block; background: #25D366; color: white; padding: 12px 24px; border-radius: 50px; text-decoration: none; font-weight: bold;">
              Connect on WhatsApp
            </a>
          </div>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
          <p class="link">${verificationLink}</p>
          <p><strong>This link expires in 24 hours.</strong></p>
          <p style="margin-top: 30px;">If you didn't create an account with ListUp, please ignore this email.</p>
          <div class="footer">This is an automated message from ListUp. Please do not reply.</div>
        </div>
      </body>
      </html>
    `,
    text: (verificationLink, userName) => `
Welcome to ListUp!

Hi ${userName || 'there'},

Thank you for signing up! To complete your registration, please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with ListUp, please ignore this email.

- ListUp Team
    `
  }
};

// Vendor pending email via Resend
async function sendVendorPendingEmail(email, userName, storeName) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h1 style="color:#111827;margin:0 0 12px;">You're almost there, ${userName}!</h1>
          <p style="color:#374151;margin:0 0 12px;">Thanks for signing up your store${storeName ? ` "${storeName}"` : ''} on ListUp.</p>
          <p style="color:#374151;margin:0 0 12px;">Your vendor account is <strong>pending verification</strong>. Our team will review your details and reach out shortly.</p>
          <p style="color:#374151;margin:0 0 16px;">You can read about the process here:</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/welcome/vendor" style="color:#84cc16;font-weight:600;">Vendor Welcome & Next Steps</a></p>
          <p style="color:#6b7280;margin-top:24px;font-size:12px;">If you didn't request this, please ignore this email.</p>
        </div>
      </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'ListUp <noreply@listup.ng>',
      to: email,
      subject: 'Your vendor account is pending verification',
      html
    });

    if (error) {
      console.error('❌ Resend vendor pending email error:', error);
      return false;
    }

    console.log(`✅ Vendor pending email sent to: ${email} (${data?.id})`);
    return true;
  } catch (err) {
    console.error('❌ Failed sending vendor pending email:', err);
    return false;
  }
}

// ==========================
// Main Function
// ==========================
async function sendPasswordResetCode(email, code, userName = null) {
  const template = EMAIL_TEMPLATES.PASSWORD_RESET;
  console.log(email, code, userName);

  try {
    const { data, error } = await resend.emails.send({
      from: 'ListUp <noreply@listup.ng>',
      to: email,
      subject: template.subject,
      html: template.html(code, userName),
      text: template.text(code, userName),
    });
    console.log(email, code, userName);

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw new Error('Failed to send verification email');
    }

    console.log(`✅ Password reset email sent to: ${email}`);
    console.log(`📧 Message ID: ${data?.id}`);

    return true;
  } catch (error) {
    console.error('❌ Unexpected Error:', error);
    throw new Error('Failed to send verification email');
  }
}


/**
 * Send welcome email to new users
 * @param {string} email - Recipient email
 * @param {string} userName - User's name
 * @returns {Promise<boolean>}
 */
async function sendWelcomeEmail(email, userName) {
  try {
    const mailOptions = {
      from: {
        name: 'ListUp Team',
        address: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@listup.ng'
      },
      to: email,
      subject: 'Welcome to ListUp! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to ListUp</title>
        </head>
        <body>
          <h1>Welcome to ListUp, ${userName}! 🎉</h1>
          <p>Thank you for joining our community marketplace.</p>
          <p>Start exploring and discover amazing deals!</p>
        </body>
        </html>
      `,
      text: `Welcome to ListUp, ${userName}! 🎉\n\nThank you for joining our community marketplace.\nStart exploring and discover amazing deals!`
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Welcome email sent to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);

    // Log Mailtrap info if using it
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log(`🔍 Check Mailtrap inbox: ${process.env.MAILTRAP_INBOX_URL || 'https://mailtrap.io'}`);
    }

    return true;

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false; // Don't throw for welcome emails
  }
}

/**
 * Test email service connectivity
 * @returns {Promise<boolean>}
 */
async function testEmailService() {
  try {
    // Send a test email to verify configuration
    const mailOptions = {
      from: {
        name: 'ListUp Test',
        address: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@listup.ng'
      },
      to: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@listup.ng',
      subject: 'ListUp Email Service Test',
      text: 'This is a test email to verify the email service is working correctly.',
      html: '<h1>ListUp Email Service Test</h1><p>This is a test email to verify the email service is working correctly.</p>'
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email service test successful');
    console.log(`📧 Test message ID: ${info.messageId}`);

    // Log Mailtrap info if using it
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log(`🔍 Check Mailtrap inbox: ${process.env.MAILTRAP_INBOX_URL || 'https://mailtrap.io'}`);
    }

    return true;

  } catch (error) {
    console.error('❌ Email service test failed:', error);
    return false;
  }
}

/**
 * Verify email service configuration
 * @returns {Promise<boolean>}
 */
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log('✅ Email service configuration verified');

    // Log current email service
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log('📧 Using Mailtrap for email testing');
    } else if (process.env.NODE_ENV === 'production') {
      console.log('📧 Using production SMTP');
    } else {
      console.log('📧 Using Gmail SMTP');
    }

    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error);
    return false;
  }
}

/**
 * Send email verification link to new users
 * @param {string} email - Recipient email
 * @param {string} verificationLink - Verification URL with token
 * @param {string} userName - User's name
 * @returns {Promise<boolean>}
 */
async function sendEmailVerification(email, verificationLink, userName = null) {
  const template = EMAIL_TEMPLATES.EMAIL_VERIFICATION;

  try {
    // In development with Resend sandbox, only send to verified email
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const verifiedEmail = 'benedictnnaoma0@gmail.com'; // Your verified Resend email
    const recipientEmail = isDevelopment ? verifiedEmail : email;

    // Log if we're redirecting the email in development
    if (isDevelopment && email !== verifiedEmail) {
      console.log(`📧 [DEV MODE] Redirecting email from ${email} to ${verifiedEmail}`);
      console.log(`🔗 Verification link: ${verificationLink}`);
    }

    const { data, error } = await resend.emails.send({
      from: 'ListUp <noreply@listup.ng>',
      to: recipientEmail,
      subject: template.subject,
      html: template.html(verificationLink, userName),
      text: template.text(verificationLink, userName),
    });

    if (error) {
      console.error('❌ Resend API Error (Email Verification):', error);

      // In development, log the verification link so you can still test
      if (isDevelopment) {
        console.log('⚠️  Email failed but here is the verification link for testing:');
        console.log(`🔗 ${verificationLink}`);
        console.log('💡 Copy this link and paste in browser to verify the account');
        // Don't throw error in development - allow registration to continue
        return true;
      }

      throw new Error('Failed to send verification email');
    }

    console.log(`✅ Email verification sent to: ${recipientEmail}`);
    if (isDevelopment && email !== recipientEmail) {
      console.log(`   (Original recipient: ${email})`);
    }
    console.log(`📧 Message ID: ${data?.id}`);

    return true;
  } catch (error) {
    console.error('❌ Unexpected Error (Email Verification):', error);

    // In development, don't fail registration due to email issues
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  [DEV MODE] Continuing registration despite email error');
      return true;
    }

    throw new Error('Failed to send verification email');
  }
}

/**
 * KYC Email Functions
 */
async function sendKYCEmail(email, templateName, ...args) {
  const templates = {
    kycSubmitted: (name) => ({
      subject: 'KYC Submission Received - ListUp',
      html: `<div style="font-family: Arial;"><h2>KYC Received</h2><p>Hi ${name}, we've received your KYC submission and will review it shortly.</p></div>`
    }),
    interviewScheduled: (name, datetime) => ({
      subject: 'Interview Scheduled - ListUp',
      html: `<div><h2>Interview Scheduled</h2><p>Hi ${name}, your interview is scheduled for ${new Date(datetime).toLocaleString()}.</p></div>`
    }),
    kycApproved: (name, fee) => ({
      subject: 'KYC Approved - Payment Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">🎉 KYC Approved!</h2>
          <p>Hi ${name},</p>
          <p>Great news! Your KYC submission has been approved.</p>
          <p>To complete your verification and unlock unlimited listings, please pay the one-time verification fee of <strong>₦${fee.toLocaleString()}</strong>.</p>

          <p style="margin: 32px 0; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/kyc-payment" style="background-color: #84cc16; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Pay Now with Paystack</a>
          </p>
          
          <div style="background-color: #f0f9ff; border-left: 4px solid #84cc16; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              ✓ Secure payment via Paystack<br>
              ✓ Instant verification upon payment<br>
              ✓ Unlock unlimited product listings
            </p>
          </div>

          <p style="font-size: 14px; color: #666; text-align: center;">Once payment is confirmed, you'll receive a verification complete email and gain full access to your vendor account.</p>
        </div>`
    }),
    kycRejected: (name, reason) => ({
      subject: 'KYC Update - ListUp',
      html: `<div><h2>KYC Update</h2><p>Hi ${name}, your submission was not approved. Reason: ${reason}</p></div>`
    }),
    verificationComplete: (name) => ({
      subject: "You're Verified! - ListUp",
      html: `<div><h2>You're Verified!</h2><p>Hi ${name}, your verification is complete. You now have unlimited listings!</p></div>`
    }),
    referralReward: (name, vendorName, amount) => ({
      subject: 'Referral Reward Earned!',
      html: `<div><h2>Reward Earned!</h2><p>Hi ${name}, ${vendorName} completed verification. You earned ₦${amount.toLocaleString()}!</p></div>`
    }),
    kycReminder: (name, days) => ({
      subject: `${days} Days Left - Complete KYC`,
      html: `<div><h2>KYC Reminder</h2><p>Hi ${name}, you have ${days} days left to complete KYC or your account will be deleted.</p></div>`
    }),
    partnerWelcome: (name, email, password, loginUrl) => ({
      subject: 'Welcome to ListUp Partner Program! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">Welcome to the Partner Team!</h2>
          <p>Hi ${name},</p>
          <p>You have been invited to join the ListUp Partner Program.</p>
          <p>We've created an account for you. Here are your login details:</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Temporary Password:</strong> ${password}</p>
          </div>

          <p>Please log in and access your partner dashboard to start earning:</p>
          <p style="text-align: center;">
            <a href="${loginUrl}" style="background-color: #84cc16; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
          </p>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Note: We recommend changing your password after your first login.
          </p>
        </div>
      `
    })
  };


try {
  const template = templates[templateName];
  if (!template) return false;

  const { subject, html } = template(...args);
  const isDev = process.env.NODE_ENV !== 'production';
  const recipientEmail = isDev ? 'benedictnnaoma0@gmail.com' : email;

  const { data, error } = resend.emails.send({
    from: 'ListUp <noreply@listup.ng>',
    to: recipientEmail,
    subject,
    html
  });

  if (error) {
    console.error(`❌ KYC email error (${templateName}):`, error);
    return false;
  }

  console.log(`✅ KYC email sent: ${templateName} (${data.id})`);
  return true;
} catch (error) {
  console.error(`❌ KYC email failed:`, error);
  return false;
}
}


/**
 * Send partner welcome email
 */
async function sendPartnerWelcomeEmail(email, name, password, loginUrl) {
  return sendKYCEmail(email, 'partnerWelcome', name, email, password, loginUrl);
}

module.exports = {
  sendPasswordResetCode,
  sendWelcomeEmail,
  testEmailService,
  verifyEmailConfig,
  sendVendorPendingEmail,
  sendEmailVerification,
  sendKYCEmail,
  sendPartnerWelcomeEmail
};
