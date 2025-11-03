// Advertisement Expiry Cron Job
// COPY THIS FILE TO: Backend/src/jobs/advertisement-expiry.job.js

const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Schedule a cron job to automatically deactivate expired advertisements
 * Runs every hour at the start of the hour (0 * * * *)
 */
const scheduleAdvertisementExpiry = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      
      // Find and deactivate expired advertisements
      const result = await prisma.advertisement.updateMany({
        where: {
          isActive: true,
          expiryDate: {
            lt: now
          }
        },
        data: {
          isActive: false
        }
      });

      if (result.count > 0) {
        console.log(`[Advertisement Expiry] Deactivated ${result.count} expired advertisement(s) at ${now.toISOString()}`);
      }
    } catch (error) {
      console.error('[Advertisement Expiry] Error:', error);
    }
  });

  console.log('[Advertisement Expiry] Cron job scheduled - runs every hour');
};

module.exports = { scheduleAdvertisementExpiry };
