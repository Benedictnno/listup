const nodemailer = require('nodemailer');

// Configure transporter using environment variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * KYC Email Functions adapted for Admin Backend using Nodemailer
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
            <a href="${process.env.MAIN_FRONTEND_URL || 'http://localhost:3000'}/dashboard/kyc-payment" style="background-color: #84cc16; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">Pay Now with Paystack</a>
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
        })
    };

    try {
        const template = templates[templateName];
        if (!template) {
            console.error(`❌ Template ${templateName} not found`);
            return false;
        }

        const { subject, html } = template(...args);

        const mailOptions = {
            from: `"ListUp Admin" <${process.env.EMAIL_USER || 'admin@listup.ng'}>`,
            to: email,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ KYC email sent via Nodemailer: ${templateName} (${info.messageId})`);
        return true;
    } catch (error) {
        console.error(`❌ KYC email failed via Nodemailer:`, error);
        return false;
    }
}

module.exports = {
    sendKYCEmail
};
