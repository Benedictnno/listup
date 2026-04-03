const cron = require('node-cron');
const prisma = require('../lib/prisma');

/**
 * Run daily at 2 AM to clean up old messages and empty conversations
 */
cron.schedule('0 2 * * *', async () => {
    try {
        console.log('🧹 Starting Chat System Cleanup Job...');

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Delete messages older than 30 days
        const deletedMessages = await prisma.message.deleteMany({
            where: {
                createdAt: {
                    lt: thirtyDaysAgo
                }
            }
        });

        console.log(`🗑️ Deleted ${deletedMessages.count} messages older than 30 days.`);

        // 2. Archive or delete empty conversations (optional, but good for hygiene)
        // Find conversations with lastMessageAt older than 30 days and no messages
        const oldConversations = await prisma.conversation.findMany({
            where: {
                lastMessageAt: {
                    lt: thirtyDaysAgo
                },
                messages: {
                    none: {}
                }
            },
            select: { id: true }
        });

        if (oldConversations.length > 0) {
            const conversationIds = oldConversations.map(c => c.id);
            await prisma.conversation.deleteMany({
                where: {
                    id: { in: conversationIds }
                }
            });
            console.log(`🗑️ Deleted ${oldConversations.length} empty or inactive conversations.`);
        }

        console.log('✅ Chat System Cleanup Job completed successfully.');
    } catch (error) {
        console.error('❌ Error in Chat Cleanup job:', error);
    }
});

console.log('✅ Chat cleanup job scheduled (runs daily at 2 AM)');

module.exports = {};
