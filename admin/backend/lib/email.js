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

module.exports = {
    sendPartnerWelcomeEmail
};
