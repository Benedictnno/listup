const nodemailer = require('nodemailer');

// Create transporter based on environment
let transporter;

if (process.env.EMAIL_SERVICE === 'mailtrap') {
  // Mailtrap (Development/Testing)
  transporter = nodemailer.createTransporter({
    host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
} else if (process.env.NODE_ENV === 'production') {
  // Production: Use custom SMTP
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'mail.listup.ng',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'noreply@listup.ng',
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false // For self-signed certificates
    }
  });
} else {
  // Development: Use Gmail SMTP
  transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD // Use App Password, not regular password
    }
  });
}

// Email templates
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
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container { 
            background: white; 
            padding: 40px; 
            border-radius: 12px; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
          }
          .logo { 
            font-size: 28px; 
            font-weight: bold; 
            color: #84cc16; 
            margin-bottom: 20px;
          }
          .code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #84cc16; 
            background: #f0f9ff; 
            padding: 20px; 
            border-radius: 8px; 
            margin: 30px 0; 
            font-family: monospace;
            letter-spacing: 4px;
          }
          .warning { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 8px; 
            padding: 15px; 
            margin: 20px 0; 
            color: #92400e;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            color: #6b7280; 
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ListUp</div>
          
          <h1>Reset Your Password</h1>
          
          <p>Hi ${userName || 'there'},</p>
          
          <p>We received a request to reset your password for your ListUp account. Use the verification code below to complete the process:</p>
          
          <div class="code">${code}</div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong><br>
            If you didn't request this password reset, please ignore this email. Your account is secure.
          </div>
          
          <p>Enter this code in the password reset form to continue.</p>
          
          <div class="footer">
            <p>This is an automated message from ListUp. Please do not reply to this email.</p>
            <p>Need help? Contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: (code, userName) => `
Reset Your ListUp Password

Hi ${userName || 'there'},

We received a request to reset your password for your ListUp account. Use the verification code below to complete the process:

${code}

This code will expire in 10 minutes.

Security Notice: If you didn't request this password reset, please ignore this email. Your account is secure.

Enter this code in the password reset form to continue.

---
This is an automated message from ListUp. Please do not reply to this email.
Need help? Contact our support team.
    `
  }
};

/**
 * Send password reset verification code
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} userName - User's name (optional)
 * @returns {Promise<boolean>}
 */
async function sendPasswordResetCode(email, code, userName = null) {
  try {
    const template = EMAIL_TEMPLATES.PASSWORD_RESET;
    
    const mailOptions = {
      from: {
        name: 'ListUp Support',
        address: process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@listup.ng'
      },
      to: email,
      subject: template.subject,
      html: template.html(code, userName),
      text: template.text(code, userName)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Password reset email sent to: ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    
    // Log Mailtrap info if using it
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log(`🔍 Check Mailtrap inbox: ${process.env.MAILTRAP_INBOX_URL || 'https://mailtrap.io'}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    
    // Log specific Nodemailer errors
    if (error.code) {
      console.error('Nodemailer error code:', error.code);
    }
    
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
  verifyEmailConfig
};
