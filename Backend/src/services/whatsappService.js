const twilio = require('twilio');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

const WhatsAppService = {
    /**
     * Send a welcome message to a new user
     * @param {Object} user - User object
     */
    async sendWelcomeMessage(user) {
        if (!user.phone) {
            console.warn('Cannot send WhatsApp message: User has no phone number');
            return;
        }

        // Format phone number to E.164 (assuming Nigeria +234 if missing)
        let phone = user.phone.replace(/\D/g, ''); // Remove all non-digits

        // If it starts with 0 and is 11 digits (e.g., 08012345678), remove leading 0 and add 234
        if (phone.startsWith('0') && phone.length === 11) {
            phone = '234' + phone.substring(1);
        }
        // If it's 10 digits (e.g., 8012345678), add 234
        else if (phone.length === 10) {
            phone = '234' + phone;
        }
        // If it already starts with 234, leave it (assuming it's correct)

        // Ensure + prefix
        phone = '+' + phone;

        const messageBody = `Hi ${user.name}! 👋 Welcome to ListUp Marketplace.\n\n` +
            `We're excited to have you on board. You'll receive updates on your orders and special offers here.\n\n` +
            `Reply with *START* to see what I can do for you!\n` +
            `(Reply *STOP* to unsubscribe)`;

        try {
            const message = await client.messages.create({
                body: messageBody,
                from: whatsappNumber,
                to: `whatsapp:${phone}`
            });

            await this.logMessage({
                userId: user.id,
                messageSid: message.sid,
                status: message.status,
                direction: 'outbound',
                body: messageBody
            });

            console.log(`WhatsApp welcome message sent to ${phone}`);
            return message;
        } catch (error) {
            console.error('Error sending WhatsApp welcome message:', error);
            throw error;
        }
    },

    /**
     * Handle incoming messages from webhook
     * @param {string} from - Sender's phone number (whatsapp:+123...)
     * @param {string} body - Message content
     */
    async handleIncomingMessage(from, body) {
        const cleanPhone = from.replace('whatsapp:', '');
        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        // Default response
        let responseText = "I didn't quite catch that. Reply *START* to see available options.";

        const command = body.trim().toUpperCase();

        switch (command) {
            case 'START':
            case 'HI':
            case 'HELLO':
                responseText = `🤖 *ListUp Assistant*\n\n` +
                    `Here's what I can help you with:\n` +
                    `• *PRODUCTS*: Browse categories\n` +
                    `• *OFFERS*: See today's deals\n` +
                    `• *HELP*: Customer support\n` +
                    `• *STOP*: Unsubscribe`;
                break;

            case 'PRODUCTS':
                responseText = `🛍️ *Categories*\n\n` +
                    `• Electronics\n• Fashion\n• Home & Garden\n\n` +
                    `Visit our website to see more!`;
                break;

            case 'OFFERS':
                responseText = `🔥 *Today's Hot Deals*\n\n` +
                    `• 20% off all Sneakers\n• Buy 1 Get 1 Free on Accessories\n\n` +
                    `Check the app for details!`;
                break;

            case 'HELP':
                responseText = `📞 *Support*\n\n` +
                    `Need help? You can email us at support@listup.ng or reply here and a human will get back to you shortly.`;
                break;

            case 'STOP':
                // logic to update user preference would go here
                responseText = `You have been unsubscribed from ListUp updates. Reply START to resubscribe.`;
                break;
        }

        // Send the response
        try {
            const message = await client.messages.create({
                body: responseText,
                from: whatsappNumber,
                to: from
            });

            // Log the incoming message
            if (user) {
                await this.logMessage({
                    userId: user.id,
                    messageSid: 'incoming_' + Date.now(), // Incoming msgs don't have a SID available here easily unless we parse the req fully, using placeholder
                    status: 'received',
                    direction: 'inbound',
                    body: body
                });

                // Log the response (outbound)
                await this.logMessage({
                    userId: user.id,
                    messageSid: message.sid,
                    status: message.status,
                    direction: 'outbound',
                    body: responseText
                });
            }

            return message;
        } catch (error) {
            console.error("Failed to respond to WhatsApp message", error);
        }
    },

    /**
     * Log message to database
     */
    async logMessage(data) {
        try {
            // In a real app, ensure userID exists if possible, or make it optional in schema
            if (!data.userId) return;

            await prisma.whatsAppMessageLog.create({
                data: {
                    userId: data.userId,
                    messageSid: data.messageSid,
                    status: data.status,
                    direction: data.direction,
                    body: data.body
                }
            });
        } catch (error) {
            console.error('Error logging WhatsApp message:', error);
        }
    }
};

module.exports = WhatsAppService;
