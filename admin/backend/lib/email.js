const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

const EMAIL_TEMPLATES = {
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
    }),
    interviewScheduled: (name, date, contact) => ({
        subject: 'ListUp KYC: Interview Scheduled 📅',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">KYC Interview Scheduled</h2>
          <p>Hi ${name},</p>
          <p>Your KYC interview has been scheduled for:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 8px 0;"><strong>Date & Time:</strong> ${new Date(date).toLocaleString()}</p>
            <p style="margin: 8px 0;"><strong>Contact Info:</strong> ${contact}</p>
          </div>
          <p>Please ensure you are available at the scheduled time. We will contact you via the provided info.</p>
        </div>
      `
    }),
    kycApproved: (name, fee) => ({
        subject: 'Congratulations! Your ListUp KYC is approved 🎊',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">KYC Approved!</h2>
          <p>Hi ${name},</p>
          <p>Great news! Your KYC documents have been reviewed and approved.</p>
          <p>To finalize your verification and unlock unlimited listings, please pay the signup fee of <strong>₦${fee.toLocaleString()}</strong>.</p>
          <p>You can complete the payment in your vendor dashboard.</p>
        </div>
      `
    }),
    kycRejected: (name, reason) => ({
        subject: 'Update on your ListUp KYC Application',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">KYC Application Update</h2>
          <p>Hi ${name},</p>
          <p>Unfortunately, your KYC application was not approved for the following reason:</p>
          <div style="background-color: #fee2e2; padding: 16px; border-radius: 8px; margin: 24px 0; color: #b91c1c;">
            ${reason}
          </div>
          <p>You can re-apply once the issues have been addressed. Please contact support if you have any questions.</p>
        </div>
      `
    }),
    verificationComplete: (name) => ({
        subject: 'Welcome to the Verified Club! 💎',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">Verification Complete</h2>
          <p>Hi ${name},</p>
          <p>Your payment has been confirmed and your account is now <strong>Fully Verified</strong>.</p>
          <p>You now have access to:</p>
          <ul>
            <li>Unlimited product listings</li>
            <li>Verified Vendor badge</li>
            <li>Priority search ranking</li>
          </ul>
          <p>Happy selling!</p>
        </div>
      `
    }),
    referralReward: (referrerName, vendorName, amount) => ({
        subject: 'You earned a referral reward! 💰',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #84cc16;">Referral Earning!</h2>
          <p>Hi ${referrerName},</p>
          <p>One of your referred vendors, <strong>${vendorName}</strong>, has successfully completed their verification.</p>
          <p>A referral reward of <strong>₦${amount.toLocaleString()}</strong> has been credited to your partner account.</p>
          <p>Keep the referrals coming!</p>
        </div>
      `
    })
};

/**
 * Send partner welcome email
 */
async function sendPartnerWelcomeEmail(email, name, password, loginUrl) {
    try {
        const template = EMAIL_TEMPLATES.partnerWelcome(name, email, password, loginUrl);
        const { subject, html } = template;

        const { data, error } = await resend.emails.send({
            from: 'ListUp <noreply@listup.ng>',
            to: email,
            subject,
            html
        });

        if (error) {
            console.error('❌ Partner welcome email error:', error);
            return false;
        }

        console.log(`✅ Partner welcome email sent to: ${email} (${data.id})`);
        return true;
    } catch (error) {
        console.error('❌ Partner welcome email failed:', error);
        return false;
    }
}

/**
 * Send KYC related emails
 */
async function sendKYCEmail(email, type, ...args) {
    try {
        if (!EMAIL_TEMPLATES[type]) {
            throw new Error(`Email template type [${type}] not found`);
        }

        const template = EMAIL_TEMPLATES[type](...args);
        const { subject, html } = template;

        const { data, error } = await resend.emails.send({
            from: 'ListUp <noreply@listup.ng>',
            to: email,
            subject,
            html
        });

        if (error) {
            console.error(`❌ KYC email [${type}] error:`, error);
            return false;
        }

        console.log(`✅ KYC email [${type}] sent to: ${email} (${data.id})`);
        return true;
    } catch (error) {
        console.error(`❌ KYC email [${type}] failed:`, error);
        return false;
    }
}

module.exports = {
    sendPartnerWelcomeEmail,
    sendKYCEmail
};
