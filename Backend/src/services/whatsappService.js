const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const GeminiService = require('./geminiService');
const { addToGoogleSheet } = require('../utils/googleSheets');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let sock = null;
let latestQR = null;

// Configuration constants
const RATE_LIMIT_CONFIG = {
    MAX_MESSAGES_PER_DAY: 20,
    GLOBAL_DAILY_LIMIT: 500,
    MIN_RESPONSE_DELAY: 2000,
    MAX_RESPONSE_DELAY: 8000,
    QUIET_HOURS_START: 2,
    QUIET_HOURS_END: 6,
    ENGAGEMENT_THRESHOLD: 30,
    NON_RESPONSE_PENALTY: 15,
    RESPONSE_REWARD: 5,
};

const AUTH_FOLDER = path.join(__dirname, '../../baileys_auth');

const WhatsAppService = {
    /**
     * Initialize Baileys Client
     */
    async initialize() {
        try {
            // Ensure auth folder exists
            if (!fs.existsSync(AUTH_FOLDER)) {
                fs.mkdirSync(AUTH_FOLDER, { recursive: true });
            }

            const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
            const { version } = await fetchLatestBaileysVersion();

            sock = makeWASocket({
                version,
                auth: state,
                printQRInTerminal: false,
                defaultQueryTimeoutMs: undefined,
            });

            // Handle connection updates
            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    latestQR = qr;
                    console.log('='.repeat(50));
                    console.log('📱 WhatsApp QR Code Generated!');
                    console.log('='.repeat(50));
                    qrcode.generate(qr, { small: true });
                    console.log('='.repeat(50));
                    console.log('✅ Scan the QR code above or visit:');
                    console.log('   https://api.listup.ng/whatsapp/qr');
                    console.log('='.repeat(50));
                }

                if (connection === 'close') {
                    const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                        ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                        : true;

                    console.log('Connection closed. Reconnecting:', shouldReconnect);

                    if (shouldReconnect) {
                        setTimeout(() => this.initialize(), 3000);
                    }
                } else if (connection === 'open') {
                    console.log('✅ WhatsApp Connected Successfully!');
                    latestQR = null; // Clear QR after connection
                }
            });

            // Save credentials on update
            sock.ev.on('creds.update', saveCreds);

            // Handle incoming messages
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type === 'notify') {
                    for (const message of messages) {
                        if (!message.key.fromMe && !message.key.remoteJid.endsWith('@g.us')) {
                            await this.handleIncomingMessage(message);
                        }
                    }
                }
            });

            console.log('✅ Baileys WhatsApp Client Initialized');
        } catch (error) {
            console.error('Failed to initialize Baileys:', error);
            throw error;
        }
    },

    /**
     * Check if current time is during quiet hours
     */
    isQuietHours() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= RATE_LIMIT_CONFIG.QUIET_HOURS_START &&
            hour < RATE_LIMIT_CONFIG.QUIET_HOURS_END;
    },

    /**
     * Calculate response delay
     */
    calculateResponseDelay(messageLength) {
        const baseDelay = RATE_LIMIT_CONFIG.MIN_RESPONSE_DELAY;
        const maxDelay = RATE_LIMIT_CONFIG.MAX_RESPONSE_DELAY;

        if (messageLength > 100) {
            return Math.floor(Math.random() * (maxDelay - 5000)) + 5000;
        } else if (messageLength > 50) {
            return Math.floor(Math.random() * (5000 - 3000)) + 3000;
        } else {
            return Math.floor(Math.random() * (4000 - baseDelay)) + baseDelay;
        }
    },

    /**
     * Simulate typing indicator
     */
    async simulateTyping(jid, duration) {
        if (!sock) return;

        try {
            await sock.sendPresenceUpdate('composing', jid);
            await new Promise(resolve => setTimeout(resolve, duration));
            await sock.sendPresenceUpdate('paused', jid);
        } catch (error) {
            console.error('Typing simulation error:', error);
        }
    },

    /**
     * Check and increment user's daily message count
     */
    async checkRateLimit(userId) {
        if (!userId) return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_MESSAGES_PER_DAY };

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                whatsappMessageCount: true,
                whatsappLastMessageDate: true,
            }
        });

        if (!user) return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_MESSAGES_PER_DAY };

        const today = new Date().toDateString();
        const lastMessageDate = user.whatsappLastMessageDate
            ? new Date(user.whatsappLastMessageDate).toDateString()
            : null;

        if (lastMessageDate !== today) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    whatsappMessageCount: 0,
                    whatsappLastMessageDate: new Date(),
                }
            });
            return { allowed: true, remaining: RATE_LIMIT_CONFIG.MAX_MESSAGES_PER_DAY };
        }

        if (user.whatsappMessageCount >= RATE_LIMIT_CONFIG.MAX_MESSAGES_PER_DAY) {
            return {
                allowed: false,
                remaining: 0,
                message: "You've reached your daily message limit (20 messages). Please try again tomorrow! 🙏"
            };
        }

        return {
            allowed: true,
            remaining: RATE_LIMIT_CONFIG.MAX_MESSAGES_PER_DAY - user.whatsappMessageCount
        };
    },

    /**
     * Increment user's message count
     */
    async incrementMessageCount(userId) {
        if (!userId) return;

        await prisma.user.update({
            where: { id: userId },
            data: {
                whatsappMessageCount: { increment: 1 },
                whatsappLastMessageDate: new Date(),
            }
        });
    },

    /**
     * Check global circuit breaker
     */
    async checkGlobalLimit() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const count = await prisma.whatsAppMessageLog.count({
            where: {
                createdAt: { gte: today },
                direction: 'outbound'
            }
        });

        return count < RATE_LIMIT_CONFIG.GLOBAL_DAILY_LIMIT;
    },

    /**
     * Update user engagement score
     */
    async updateEngagementScore(userId, isUserInitiated) {
        if (!userId) return;

        const adjustment = isUserInitiated
            ? RATE_LIMIT_CONFIG.RESPONSE_REWARD
            : -RATE_LIMIT_CONFIG.NON_RESPONSE_PENALTY;

        await prisma.user.update({
            where: { id: userId },
            data: {
                whatsappEngagementScore: { increment: adjustment }
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { whatsappEngagementScore: true }
        });

        if (user.whatsappEngagementScore > 100) {
            await prisma.user.update({
                where: { id: userId },
                data: { whatsappEngagementScore: 100 }
            });
        } else if (user.whatsappEngagementScore < 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { whatsappEngagementScore: 0 }
            });
        }
    },

    /**
     * Check if user can receive messages
     */
    async canSendMessage(userId) {
        if (!userId) return { allowed: false, reason: 'No user ID' };

        const globalOk = await this.checkGlobalLimit();
        if (!globalOk) {
            console.warn('⚠️ Global daily limit reached. Circuit breaker activated.');
            return { allowed: false, reason: 'Global limit reached' };
        }

        if (this.isQuietHours()) {
            console.log('🌙 Quiet hours active. Message queued until 6 AM.');
            return { allowed: false, reason: 'Quiet hours' };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                whatsappStopRequested: true,
                whatsappEngagementScore: true,
            }
        });

        if (!user) return { allowed: false, reason: 'User not found' };

        if (user.whatsappStopRequested) {
            return { allowed: false, reason: 'User opted out' };
        }

        if (user.whatsappEngagementScore < RATE_LIMIT_CONFIG.ENGAGEMENT_THRESHOLD) {
            console.log(`⚠️ User engagement too low (${user.whatsappEngagementScore}). Skipping message.`);
            return { allowed: false, reason: 'Low engagement' };
        }

        return { allowed: true };
    },

    /**
     * Handle STOP command
     */
    async handleStopCommand(userId, phone) {
        await prisma.user.update({
            where: { id: userId },
            data: { whatsappStopRequested: true }
        });

        const stopMessage = "✅ You've been unsubscribed from ListUp WhatsApp messages.\n\n" +
            "You won't receive automated messages anymore. To re-enable, visit your account settings on listup.ng";

        await this.sendMessage(phone, stopMessage);

        console.log(`🛑 User ${userId} opted out via STOP command`);
    },

    /**
     * Send a message to a user
     */
    async sendMessage(to, text) {
        if (!sock) {
            console.error('Baileys client not initialized');
            return null;
        }

        try {
            const jid = to.includes('@s.whatsapp.net') ? to : `${to.replace(/\D/g, '')}@s.whatsapp.net`;
            const result = await sock.sendMessage(jid, { text });
            return result;
        } catch (error) {
            console.error('Baileys Send Error:', error);
            throw error;
        }
    },

    /**
     * Register a new contact from WhatsApp
     */
    async registerNewContact(phone, pushname) {
        try {
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const email = `wa_${phone}@listup.bot`;

            const newUser = await prisma.user.create({
                data: {
                    name: pushname || 'WhatsApp Customer',
                    email: email,
                    password: hashedPassword,
                    phone: phone,
                    whatsappOptIn: true,
                    whatsappEngagementScore: 100,
                }
            });

            console.log(`👤 Auto-registered new WhatsApp user: ${phone}`);

            try {
                await addToGoogleSheet(
                    newUser.name,
                    'WhatsApp Lead',
                    newUser.email,
                    newUser.phone,
                    'Automatically added via WhatsApp Bot'
                );
            } catch (sheetError) {
                console.error('Failed to sync new contact to Google Sheets:', sheetError.message);
            }

            return newUser;
        } catch (error) {
            console.error('Error in registerNewContact:', error);
            return null;
        }
    },

    /**
     * Handle incoming messages from Baileys
     */
    async handleIncomingMessage(message) {
        const from = message.key.remoteJid;
        const messageContent = message.message?.conversation ||
            message.message?.extendedTextMessage?.text || '';

        const audioMessage = message.message?.audioMessage;
        let audioData = null;

        if (audioMessage && audioMessage.url) {
            console.log('🎙️ Received voice message/audio');
            try {
                const stream = await downloadContentFromMessage(audioMessage, 'audio');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                audioData = {
                    buffer,
                    mimetype: audioMessage.mimetype || 'audio/ogg; codecs=opus'
                };
            } catch (downloadError) {
                console.error('Failed to download audio message:', downloadError);
            }
        }

        if (!messageContent && !audioData) return;

        const cleanPhone = from.split('@')[0];
        const pushname = message.pushName || 'Customer';

        let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        if (!user) {
            user = await this.registerNewContact(cleanPhone, pushname);
        }

        const userId = user?.id;
        const userName = user ? user.name : pushname;

        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { lastWhatsappInteraction: new Date() }
            });
        }

        if (userId) {
            await this.logMessage({
                userId: userId,
                messageSid: message.key.id,
                status: 'received',
                direction: 'inbound',
                body: messageContent || (audioData ? '[Voice Message]' : '')
            });
        }

        const stopKeywords = ['stop', 'unsubscribe', 'stop bot', 'opt out', 'optout'];
        if (stopKeywords.some(keyword => messageContent.toLowerCase().includes(keyword))) {
            if (userId) {
                await this.handleStopCommand(userId, cleanPhone);
            }
            return;
        }

        const rateLimit = await this.checkRateLimit(userId);
        if (!rateLimit.allowed) {
            await this.sendMessage(from, rateLimit.message);

            if (userId) {
                await this.logMessage({
                    userId: userId,
                    messageSid: `throttled_${Date.now()}`,
                    status: 'throttled',
                    direction: 'outbound',
                    body: rateLimit.message,
                    wasThrottled: true
                });
            }
            return;
        }

        const canSend = await this.canSendMessage(userId);
        if (!canSend.allowed && canSend.reason !== 'Quiet hours') {
            console.log(`Cannot send to user ${userId}: ${canSend.reason}`);
            return;
        }

        if (canSend.reason === 'Quiet hours') {
            console.log('Skipping response during quiet hours');
            return;
        }

        // Contact reminder (VCard)
        if (userId && user.whatsappContactReminderCount < 2) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const lastReminder = user.lastContactReminderDate ? new Date(user.lastContactReminderDate) : null;

            if (!lastReminder || lastReminder < oneWeekAgo) {
                try {
                    console.log(`📇 Sending contact reminder to ${cleanPhone} (Reminder #${user.whatsappContactReminderCount + 1})`);

                    const vcard = 'BEGIN:VCARD\n'
                        + 'VERSION:3.0\n'
                        + 'FN:ListUp Bot\n'
                        + 'ORG:ListUp;\n'
                        + 'TEL;type=CELL;type=VOICE:+234 000 000 0000\n'
                        + 'END:VCARD';

                    await sock.sendMessage(from, {
                        contacts: {
                            displayName: 'ListUp Bot',
                            contacts: [{ vcard }]
                        }
                    });

                    const reminderText = `Hi ${userName}! I've saved your contact to my list. 🤝\n\nPlease save mine too so you can see our daily deals and market updates on my Status! 🧺✨`;
                    await this.sendMessage(from, reminderText);

                    await prisma.user.update({
                        where: { id: userId },
                        data: {
                            whatsappContactReminderCount: { increment: 1 },
                            lastContactReminderDate: new Date()
                        }
                    });
                } catch (reminderError) {
                    console.error('Failed to send contact reminder:', reminderError);
                }
            }
        }

        // Fetch chat history
        let history = [];
        if (userId) {
            history = await prisma.whatsAppMessageLog.findMany({
                where: { userId: userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { body: true, direction: true }
            });
            history.reverse();
        }

        console.log('--- Debugging Context ---');
        console.log('Current Message:', messageContent);
        console.log('History Context:', JSON.stringify(history, null, 2));

        const responseText = await GeminiService.generateResponse(userName, from, messageContent, history, audioData);

        const delay = this.calculateResponseDelay(responseText.length);

        await this.simulateTyping(from, delay);

        try {
            const result = await sock.sendMessage(from, { text: responseText });

            await this.incrementMessageCount(userId);
            await this.updateEngagementScore(userId, true);

            if (userId && result) {
                await this.logMessage({
                    userId: userId,
                    messageSid: result.key.id,
                    status: 'sent',
                    direction: 'outbound',
                    body: responseText,
                    responseDelay: delay
                });
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
                    body: data.body,
                    responseDelay: data.responseDelay || null,
                    wasThrottled: data.wasThrottled || false
                }
            });
        } catch (error) {
            console.error('Error logging WhatsApp message:', error);
        }
    },

    /**
     * Reset daily counters
     */
    async resetDailyCounters() {
        try {
            await prisma.user.updateMany({
                where: {
                    whatsappMessageCount: { gt: 0 }
                },
                data: {
                    whatsappMessageCount: 0
                }
            });
            console.log('✅ Daily WhatsApp message counters reset');
        } catch (error) {
            console.error('Error resetting daily counters:', error);
        }
    },

    /**
     * Get the latest QR code
     */
    getQR() {
        return latestQR;
    }
};

module.exports = WhatsAppService;
