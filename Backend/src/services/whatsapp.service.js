const wppconnect = require('@wppconnect-team/wppconnect');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let client = null;
let lastQr = null;

/**
 * Format JID correctly
 * If it has @ suffixes (@c.us, @lid, @g.us), leave it.
 * Otherwise, append @c.us
 */
function formatJid(to) {
    if (!to) return '';
    let contact = String(to).trim();
    // If it already has an @ suffix, it's a valid WhatsApp ID (JID/LID/Group)
    if (contact.includes('@')) return contact;
    // Otherwise, clean numbers and append @c.us
    return contact.replace(/\D/g, '') + '@c.us';
}

/**
 * Initialize WhatsApp Client
 */
async function initWhatsApp() {
    console.log('[WhatsApp] Initializing Bot...');
    try {
        client = await wppconnect.create({
            session: 'listup-bot',
            catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
                lastQr = base64Qrimg;
                console.log('[WhatsApp] QR Code Received. Attempt:', attempts);
                console.log(asciiQR);
            },
            statusFind: (statusSession, session) => {
                console.log('[WhatsApp] Status Session:', statusSession, '| Session:', session);
            },
            headless: true,
            devtools: false,
            useChrome: true,
            debug: true, // Enable debug for more info
            logQR: true,
            updatesLog: true,
            autoClose: 0,
        });

        console.log('✅ WhatsApp Bot Connected!');

        // Message Listener
        client.onMessage(async (message) => {
            console.log(`[WhatsApp] Incoming message from ${message.from}: "${message.body}"`);
            if (message.isGroupMsg) {
                console.log('[WhatsApp] Skipping group message.');
                return;
            }

            try {
                const { handleWhatsAppMessage } = require('../bot/bot-handlers');
                console.log('[WhatsApp] Routing to bot-handlers...');
                await handleWhatsAppMessage(client, message);
                console.log('[WhatsApp] Bot-handlers finished processing.');
            } catch (err) {
                console.error('[WhatsApp] [Bot Handlers Error]:', err);
            }
        });

    } catch (error) {
        console.error('❌ Failed to initialize WhatsApp Bot:', error);
    }
}

/**
 * Send WhatsApp Message
 */
async function sendMessage(to, body, options = {}) {
    if (!client) return null;
    const jid = formatJid(to);
    console.log(`[WhatsApp] Attempting to send message to ${jid}...`);
    try {
        const result = await client.sendText(jid, body, options);
        console.log(`[WhatsApp] Message sent to ${jid}. Result:`, result ? 'SUCCESS' : 'EMPTY');
        return result;
    } catch (error) {
        console.error(`[WhatsApp] Failed to send message to ${jid}:`, error);
        return null;
    }
}

/**
 * Send Image with Caption
 */
async function sendImage(to, imageUrl, caption) {
    if (!client) return null;
    const jid = formatJid(to);
    console.log(`[WhatsApp] Attempting to send image to ${jid}...`);
    try {
        const result = await client.sendImage(jid, imageUrl, 'product.png', caption);
        console.log(`[WhatsApp] Image sent to ${jid}. Result:`, result ? 'SUCCESS' : 'EMPTY');
        return result;
    } catch (error) {
        console.error(`[WhatsApp] Failed to send image to ${jid}:`, error);
        return null;
    }
}

/**
 * Send Buttons
 * Note: Buttons are sensitive to JID type (LID vs JID)
 * Fallback to Poll if buttons are problematic
 */
async function sendButtons(to, title, buttons, footer = 'Listup Assistant') {
    if (!client) return null;
    const jid = formatJid(to);
    console.log(`[WhatsApp] Attempting to send buttons to ${jid}...`);

    try {
        // Try Poll as it is more compatible with newer WA versions and LID
        return await client.sendPollMessage(jid, title, buttons.map(b => b.text), { selectableCount: 1 });
    } catch (error) {
        console.error(`[WhatsApp] Failed to send poll/buttons to ${jid}:`, error);
        // Fallback to plain text
        const buttonText = buttons.map((b, i) => `${i + 1}. ${b.text}`).join('\n');
        return await client.sendText(jid, `${title}\n\n${buttonText}`);
    }
}

/**
 * Send List Message
 */
async function sendListMessage(to, title, buttonText, sections, footer = 'Listup Assistant') {
    if (!client) return null;
    const jid = formatJid(to);
    try {
        return await client.sendListMessage(jid, {
            buttonText: buttonText,
            description: title,
            sections: sections, // [{ title: '...', rows: [{ rowId: '...', title: '...', description: '...' }] }]
            footer: footer
        });
    } catch (error) {
        console.error(`[WhatsApp] Failed to send list to ${jid}:`, error);
        return await client.sendText(jid, `${title}\n\n(Menu failed to load, please type HELP)`);
    }
}

module.exports = {
    initWhatsApp,
    sendMessage,
    sendImage,
    sendButtons,
    sendListMessage,
    getClient: () => client,
    getQr: () => lastQr
};
