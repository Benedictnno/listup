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
          <p>If you didn’t request this, please ignore this email.</p>
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

If you didn’t request this, please ignore this email.

- ListUp Support
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
      from: 'ListUp <onboarding@resend.dev>',
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
console.log(email,code, userName);

  try {
    const { data, error } = await resend.emails.send({
      from: 'ListUp <onboarding@resend.dev>', // ✅ use verified domain or sandbox
      to: email,
      subject: template.subject,
      html: template.html(code, userName),
      text: template.text(code, userName),
    });
console.log(email,code, userName);

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

module.exports = {
  sendPasswordResetCode,
  sendWelcomeEmail,
  testEmailService,
  verifyEmailConfig,
  sendVendorPendingEmail
};
