const cron = require('node-cron');
const whatsappService = require('../services/whatsappService');

/**
 * Schedule WhatsApp maintenance tasks
 * Runs daily at midnight (00:00) to reset message counters
 */
function scheduleWhatsAppMaintenance() {
    // Run at midnight every day
    cron.schedule('0 0 * * *', async () => {
        console.log('🔄 Running WhatsApp daily maintenance...');

        try {
            // Reset daily message counters
            await whatsappService.resetDailyCounters();

            // Log statistics
            const prisma = require('../lib/prisma');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stats = {
                messagesSent: await prisma.whatsAppMessageLog.count({
                    where: {
                        createdAt: { gte: today },
                        direction: 'outbound'
                    }
                }),
                messagesReceived: await prisma.whatsAppMessageLog.count({
                    where: {
                        createdAt: { gte: today },
                        direction: 'inbound'
                    }
                }),
                throttledUsers: await prisma.whatsAppMessageLog.count({
                    where: {
                        createdAt: { gte: today },
                        wasThrottled: true
                    }
                }),
                optedOutUsers: await prisma.user.count({
                    where: { whatsappStopRequested: true }
                })
            };

            console.log('📊 WhatsApp Daily Statistics:', stats);
            console.log('✅ WhatsApp maintenance completed');

        } catch (error) {
            console.error('❌ Error in WhatsApp maintenance:', error);
        }
    });

    console.log('✅ WhatsApp maintenance scheduled (daily at midnight)');
}

module.exports = { scheduleWhatsAppMaintenance };
