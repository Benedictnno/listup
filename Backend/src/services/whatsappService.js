const wppconnect = require('@wppconnect-team/wppconnect');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const GeminiService = require('./geminiService');

let wppClient = null;

const WhatsAppService = {
    /**
     * Initialize WPPConnect Client
     */
    async initialize() {
        try {
            wppClient = await wppconnect.create({
                session: 'ListUp-Bot',
                catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
                    console.log('Terminal QR Code: ', asciiQR);
                },
                statusFind: (statusSession, session) => {
                    console.log('Status Session: ', statusSession);
                    console.log('Session name: ', session);
                },
                headless: true,
                devtools: false,
                useChrome: true,
                debug: false,
                logQR: true,
                autoClose: 300000, // 5 minutes to scan QR
                browserArgs: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            console.log('✅ WPPConnect Client Initialized');

            // Listen for messages
            wppClient.onMessage(async (message) => {
                if (message.isGroupMsg === false) {
                    await this.handleIncomingMessage(message);
                }
            });

        } catch (error) {
            console.error('Failed to initialize WPPConnect:', error);
        }
    },

    /**
     * Send a message to a user
     */
    async sendMessage(to, text) {
        if (!wppClient) {
            console.error('WPPConnect client not initialized');
            return null;
        }

        try {
            // Ensure phone format for WPP (usually number@c.us)
            const target = to.includes('@c.us') ? to : `${to.replace(/\D/g, '')}@c.us`;
            const result = await wppClient.sendText(target, text);
            return result;
        } catch (error) {
            console.error('WPPConnect Send Error:', error);
            throw error;
        }
    },

    /**
     * Send a welcome message to a new user
     */
    async sendWelcomeMessage(user) {
        if (!user.phone) {
            console.warn('Cannot send WhatsApp message: User has no phone number');
            return;
        }

        const phone = user.phone.replace(/\D/g, '');
        const messageBody = `Hi ${user.name}! 👋 Welcome to ListUp Marketplace.\n\n` +
            `I'm your ListUp Scout. I can help you find products, categories, or check out hot deals.\n\n` +
            `How can I help you today? (Try asking: "What electronics do you have?")\n` +
            `(Reply *STOP* to unsubscribe)`;

        try {
            const result = await this.sendMessage(phone, messageBody);

            if (result) {
                await this.logMessage({
                    userId: user.id,
                    messageSid: result.id,
                    status: 'sent',
                    direction: 'outbound',
                    body: messageBody
                });
            }

            console.log(`WhatsApp welcome message sent to ${phone}`);
            return result;
        } catch (error) {
            console.error('Error sending WhatsApp welcome message:', error);
            throw error;
        }
    },

    /**
     * Handle incoming messages from WPPConnect listener
     */
    async handleIncomingMessage(message) {
        const from = message.from; // e.g. "2348012345678@c.us"
        const body = message.body;
        const cleanPhone = from.split('@')[0];

        const user = await prisma.user.findUnique({ where: { phone: cleanPhone } });
        const userName = user ? user.name : "Customer";

        // Fetch chat history for context (last 10 messages)
        let history = [];
        if (user) {
            history = await prisma.whatsAppMessageLog.findMany({
                where: { userId: user.id },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { body: true, direction: true }
            });
            history.reverse();
        }

        // Generate LLM-driven response
        console.log('--- Debugging Context ---');
        console.log('Current Message:', body);
        console.log('History Context:', JSON.stringify(history, null, 2));

        const responseText = await GeminiService.generateResponse(userName, from, body, history);

        // Send the response
        try {
            // Use wppClient.reply to respond to the message
            const result = await wppClient.reply(from, responseText, message.id);

            // Log the incoming message
            if (user) {
                await this.logMessage({
                    userId: user.id,
                    messageSid: message.id,
                    status: 'received',
                    direction: 'inbound',
                    body: body
                });

                // Log the response (outbound)
                if (result) {
                    await this.logMessage({
                        userId: user.id,
                        messageSid: result.id,
                        status: 'sent',
                        direction: 'outbound',
                        body: responseText
                    });
                }
            }

            return result;
        } catch (error) {
            console.error("Failed to respond to WhatsApp message", error);
        }
    },

    /**
     * Log message to database
     */
    async logMessage(data) {
        try {
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
