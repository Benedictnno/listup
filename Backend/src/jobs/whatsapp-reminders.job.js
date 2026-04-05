const cron = require('node-cron');
const prisma = require('../lib/prisma');
const WhatsAppService = require('../services/whatsappService');

/**
 * Hourly cron job to remind sellers of unreplied messages
 */
cron.schedule('0 * * * *', async () => {
    try {
        console.log('🤖 Running WhatsApp Seller Reminders Job...');

        // 0. Circuit Breaker: Check if bot is connected
        if (!WhatsAppService.sock || !WhatsAppService.sock.user) {
            console.warn('⚠️ WhatsApp bot is not connected. Skipping reminders job.');
            return;
        }

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        // Find sellers with unreplied messages in the last 24 hours
        // A message is "unreplied" if the latest message in a conversation is from a BUYER
        // and hasn't been read/replied by the SELLER.

        const unrepliedConversations = await prisma.conversation.findMany({
            where: {
                isActive: true,
                messages: {
                    some: {
                        senderType: 'BUYER',
                        isRead: false,
                        createdAt: { gte: oneDayAgo }
                    }
                }
            },
            include: {
                seller: {
                    select: { id: true, name: true, phone: true, whatsappOptIn: true }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                senderType: 'BUYER',
                                isRead: false
                            }
                        }
                    }
                }
            }
        });

        if (unrepliedConversations.length === 0) {
            console.log('✅ No unreplied messages found for WhatsApp reminders.');
            return;
        }

        // Group by seller to avoid multiple messages to same person
        const sellerReminders = {};

        for (const conv of unrepliedConversations) {
            if (!conv.seller.phone || !conv.seller.whatsappOptIn) continue;

            if (!sellerReminders[conv.seller.id]) {
                sellerReminders[conv.seller.id] = {
                    seller: conv.seller,
                    unreadCount: 0
                };
            }
            sellerReminders[conv.seller.id].unreadCount += conv._count.messages;
        }

        for (const sellerId in sellerReminders) {
            const { seller, unreadCount } = sellerReminders[sellerId];

            const body = `📬 *Reminder: You have unreplied messages*

Hi ${seller.name}, you have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''} from potential buyers on Listup.

💬 Prompt replies help increase your seller rating and close deals faster!

🔗 https://listup.ng/messages`;

            const result = await WhatsAppService.sendMessage(seller.phone, body);
            if (result) {
                console.log(`[WhatsApp Reminder] Sent to ${seller.name} (${seller.phone})`);
            } else {
                console.warn(`[WhatsApp Reminder] FAILED to send to ${seller.name} (${seller.phone}) - Bot likely disconnected`);
            }
        }

    } catch (error) {
        console.error('❌ Error in WhatsApp Reminders job:', error);
    }
});

console.log('✅ WhatsApp Seller Reminders job scheduled (runs every hour)');
