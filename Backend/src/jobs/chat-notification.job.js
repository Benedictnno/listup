const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { sendEmail } = require('../lib/email'); // Placeholder for actual email service

/**
 * Run every 5 minutes to check for unread messages and send email notifications
 */
cron.schedule('*/5 * * * *', async () => {
    try {
        console.log('📧 Checking for unread messages to notify users...');

        const fiveMinutesAgo = new Date();
        fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

        // Find unread messages that haven't been notified yet and are older than 5 mins
        const unreadMessages = await prisma.message.findMany({
            where: {
                isRead: false,
                emailSent: false,
                createdAt: {
                    lt: fiveMinutesAgo
                }
            },
            include: {
                conversation: {
                    include: {
                        buyer: { select: { id: true, email: true, name: true } },
                        seller: { select: { id: true, email: true, name: true } },
                        listing: { select: { title: true } }
                    }
                },
                sender: { select: { name: true } }
            }
        });

        if (unreadMessages.length === 0) {
            return;
        }

        // Group messages by recipient
        const notifications = {};

        for (const msg of unreadMessages) {
            const recipient = msg.senderId === msg.conversation.buyerId
                ? msg.conversation.seller
                : msg.conversation.buyer;

            if (!notifications[recipient.id]) {
                notifications[recipient.id] = {
                    user: recipient,
                    messages: []
                };
            }
            notifications[recipient.id].messages.push(msg);
        }

        // Send emails
        for (const userId in notifications) {
            const { user, messages } = notifications[userId];
            const messageCount = messages.length;
            const lastMessage = messages[messages.length - 1];

            console.log(`📧 Sending chat notification to ${user.email} for ${messageCount} unread message(s).`);

            // TODO: Actually send the email using the project's email service
            /*
            await sendEmail({
                to: user.email,
                subject: `You have ${messageCount} new message${messageCount > 1 ? 's' : ''} on ListUp`,
                html: `
                    <h1>New messages on ListUp</h1>
                    <p>Hi ${user.name},</p>
                    <p>You have ${messageCount} unread message(s) in your ListUp inbox.</p>
                    <p><strong>Last message from ${lastMessage.sender.name}:</strong></p>
                    <p style="padding: 10px; background: #f4f4f4; border-radius: 5px;">
                        ${lastMessage.content || 'Sent an image'}
                    </p>
                    <p><a href="${process.env.FRONTEND_URL}/chat/${lastMessage.conversationId}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px;">View Messages</a></p>
                `
            });
            */

            // Mark as sent
            await prisma.message.updateMany({
                where: {
                    id: { in: messages.map(m => m.id) }
                },
                data: {
                    emailSent: true,
                    emailSentAt: new Date()
                }
            });
        }

        console.log(`✅ Processed chat notifications for ${Object.keys(notifications).length} users.`);
    } catch (error) {
        console.error('❌ Error in Chat Notification job:', error);
    }
});

console.log('✅ Chat notification job scheduled (runs every 5 minutes)');

module.exports = {};
