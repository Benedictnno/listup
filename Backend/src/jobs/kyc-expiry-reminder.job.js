const cron = require('node-cron');
const prisma = require('../lib/prisma');

// TODO: Implement email service
// const { sendEmail } = require('../lib/email');

/**
 * Run daily at 9 AM to check for expiring KYC subscriptions
 * Sends reminders at 30 days and 7 days before expiry
 */
cron.schedule('0 9 * * *', async () => {
  try {
    console.log('🔍 Checking for expiring KYC subscriptions...');

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoon = await prisma.vendorKYC.findMany({
      where: {
        paymentStatus: 'SUCCESS',
        validUntil: {
          gte: now,
          lte: thirtyDaysFromNow,
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            name: true,
            email: true,
            vendorProfile: {
              select: { storeName: true },
            },
          },
        },
      },
    });

    for (const kyc of expiringSoon) {
      const daysRemaining = Math.ceil(
        (new Date(kyc.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysRemaining === 30 || daysRemaining === 7) {
        console.log(`📧 Sending ${daysRemaining}-day reminder to ${kyc.vendor.email}`);

        // TODO: Implement email sending
        // await sendEmail({
        //   to: kyc.vendor.email,
        //   subject: `Your ListUp KYC expires in ${daysRemaining} days`,
        //   html: generateReminderEmail(kyc.vendor.name, daysRemaining, kyc.vendor.vendorProfile?.storeName),
        // });
      }
    }

    console.log(`✅ Processed ${expiringSoon.length} expiring KYC subscriptions`);
  } catch (error) {
    console.error('❌ Error in KYC expiry reminder job:', error);
  }
});

console.log('✅ KYC expiry reminder job scheduled (runs daily at 9 AM)');

module.exports = {};
