const wppconnect = require('@wppconnect-team/wppconnect');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const GeminiService = require('./geminiService');
const { addToGoogleSheet } = require('../utils/googleSheets');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

let wppClient = null;

// Configuration constants
const RATE_LIMIT_CONFIG = {
    MAX_MESSAGES_PER_DAY: 20,          // Max messages per user per day
    GLOBAL_DAILY_LIMIT: 500,           // Circuit breaker: total daily messages
    MIN_RESPONSE_DELAY: 2000,          // 2 seconds minimum
    MAX_RESPONSE_DELAY: 8000,          // 8 seconds maximum
    QUIET_HOURS_START: 2,              // 2 AM
    QUIET_HOURS_END: 6,                // 6 AM
    ENGAGEMENT_THRESHOLD: 30,          // Stop messaging if score below this
    NON_RESPONSE_PENALTY: 15,          // Decrease score by this for non-response
    RESPONSE_REWARD: 5,                // Increase score by this for response
};

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
                useChrome: false, // Use Chromium by default, or system browser
                debug: false,
                logQR: true,
                autoClose: 300000, // 5 minutes to scan QR
                browserArgs: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-notifications',
                    '--disable-component-update',
                    '--disable-sync'
                ],
                puppetOptions: {
                    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, // Fallback to bundled chromium
                    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
                }
            });

            console.log('✅ WPPConnect Client Initialized');
            console.log('Browser Args:', JSON.stringify(config.browserArgs));
            if (process.env.PUPPETEER_EXECUTABLE_PATH) {
                console.log('Using Custom Executable Path:', process.env.PUPPETEER_EXECUTABLE_PATH);
            } else {
                console.log('Using Default Bundled Chromium');
            }

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
     * Check if current time is during quiet hours (2 AM - 6 AM)
     */
    isQuietHours() {
        const now = new Date();
        const hour = now.getHours();
        return hour >= RATE_LIMIT_CONFIG.QUIET_HOURS_START &&
            hour < RATE_LIMIT_CONFIG.QUIET_HOURS_END;
    },

    /**
     * Calculate response delay based on message complexity
     */
    calculateResponseDelay(messageLength) {
        const baseDelay = RATE_LIMIT_CONFIG.MIN_RESPONSE_DELAY;
        const maxDelay = RATE_LIMIT_CONFIG.MAX_RESPONSE_DELAY;

        // Longer messages = longer delays (more realistic)
        if (messageLength > 100) {
            return Math.floor(Math.random() * (maxDelay - 5000)) + 5000; // 5-8s
        } else if (messageLength > 50) {
            return Math.floor(Math.random() * (5000 - 3000)) + 3000; // 3-5s
        } else {
            return Math.floor(Math.random() * (4000 - baseDelay)) + baseDelay; // 2-4s
        }
    },

    /**
     * Simulate typing indicator
     */
    async simulateTyping(to, duration) {
        if (!wppClient) return;

        try {
            await wppClient.startTyping(to);
            await new Promise(resolve => setTimeout(resolve, duration));
            await wppClient.stopTyping(to);
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

        // Reset counter if it's a new day
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

        // Check if limit exceeded
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
                whatsappEngagementScore: {
                    increment: adjustment
                },
                // Clamp between 0 and 100
            }
        });

        // Fetch updated score to clamp it
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

        // Check global limit (circuit breaker)
        const globalOk = await this.checkGlobalLimit();
        if (!globalOk) {
            console.warn('⚠️ Global daily limit reached. Circuit breaker activated.');
            return { allowed: false, reason: 'Global limit reached' };
        }

        // Check quiet hours
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

        // Check if user opted out
        if (user.whatsappStopRequested) {
            return { allowed: false, reason: 'User opted out' };
        }

        // Check engagement score
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

            // Sync to Google Sheets
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
     * Handle incoming messages from WPPConnect listener
     */
    async handleIncomingMessage(message) {
        const from = message.from; // e.g. "2348012345678@c.us"
        const body = message.body;
        const pushname = message.sender?.pushname || message.sender?.name || 'Customer';
        const cleanPhone = from.split('@')[0];

        let user = await prisma.user.findUnique({ where: { phone: cleanPhone } });

        // Auto-register if user doesn't exist
        if (!user) {
            user = await this.registerNewContact(cleanPhone, pushname);
        }

        const userId = user?.id;
        const userName = user ? user.name : pushname;

        // Update last interaction time
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: { lastWhatsappInteraction: new Date() }
            });
        }

        // Log incoming message
        if (userId) {
            await this.logMessage({
                userId: userId,
                messageSid: message.id,
                status: 'received',
                direction: 'inbound',
                body: body
            });
        }

        // Check for STOP command (case-insensitive)
        const stopKeywords = ['stop', 'unsubscribe', 'stop bot', 'opt out', 'optout'];
        if (stopKeywords.some(keyword => body.toLowerCase().includes(keyword))) {
            if (userId) {
                await this.handleStopCommand(userId, cleanPhone);
            }
            return;
        }

        // Check rate limit
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

        // Check if we can send (engagement, global limits, etc.)
        const canSend = await this.canSendMessage(userId);
        if (!canSend.allowed && canSend.reason !== 'Quiet hours') {
            console.log(`Cannot send to user ${userId}: ${canSend.reason}`);
            return;
        }

        // If quiet hours, just log and skip
        if (canSend.reason === 'Quiet hours') {
            console.log('Skipping response during quiet hours');
            return;
        }

        // Check for contact save reminders
        if (userId && user.whatsappContactReminderCount < 2) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const lastReminder = user.lastContactReminderDate ? new Date(user.lastContactReminderDate) : null;

            if (!lastReminder || lastReminder < oneWeekAgo) {
                try {
                    console.log(`📇 Sending VCard and reminder to ${cleanPhone} (Reminder #${user.whatsappContactReminderCount + 1})`);

                    // Send VCard
                    const botName = "ListUp Bot";
                    let botId = wppClient.session;
                    try {
                        const wid = await wppClient.getWid();
                        if (wid) botId = wid;
                    } catch (e) {
                        console.warn('Could not get bot WID, using session name');
                    }

                    await wppClient.sendContactVcard(from, botId, botName);

                    const reminderText = `Hi ${userName}! I've saved your contact to my list. 🤝\n\nPlease save mine too so you can see our daily deals and market updates on my Status! 🧺✨`;
                    await this.sendMessage(from, reminderText);

                    // Update reminder count and date
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

        // Fetch chat history for context (last 10 messages)
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

        // Generate LLM-driven response
        console.log('--- Debugging Context ---');
        console.log('Current Message:', body);
        console.log('History Context:', JSON.stringify(history, null, 2));

        const responseText = await GeminiService.generateResponse(userName, from, body, history);

        // Calculate response delay based on message complexity
        const delay = this.calculateResponseDelay(responseText.length);

        // Send typing indicator
        await this.simulateTyping(from, delay);

        // Send the response
        try {
            const result = await wppClient.reply(from, responseText, message.id);

            // Increment message count
            await this.incrementMessageCount(userId);

            // Update engagement score (user initiated, so positive)
            await this.updateEngagementScore(userId, true);

            // Log the response (outbound)
            if (userId && result) {
                await this.logMessage({
                    userId: userId,
                    messageSid: result.id,
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
     * Reset daily counters (called by cron job)
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
    }
};

module.exports = WhatsAppService;
