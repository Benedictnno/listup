const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

let client = null;
let lastQr = null;

const AUTH_FOLDER = path.join(__dirname, '../../baileys_auth');

/**
 * Format JID correctly for Baileys
 * Baileys uses @s.whatsapp.net instead of @c.us
 */
function formatJid(to) {
    if (!to) return '';
    let contact = String(to).trim();
    // If it already has an @ suffix, handle conversion
    if (contact.includes('@')) {
        // Convert old @c.us format to @s.whatsapp.net
        return contact.replace('@c.us', '@s.whatsapp.net');
    }
    // Otherwise, clean numbers and append @s.whatsapp.net
    return contact.replace(/\D/g, '') + '@s.whatsapp.net';
}

/**
 * Initialize WhatsApp Client with Baileys
 */
async function initWhatsApp() {
    console.log('[WhatsApp] Initializing Bot with Baileys...');
    try {
        // Ensure auth folder exists
        if (!fs.existsSync(AUTH_FOLDER)) {
            fs.mkdirSync(AUTH_FOLDER, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
        const { version } = await fetchLatestBaileysVersion();

        client = makeWASocket({
            version,
            auth: state,
            printQRInTerminal: false,
            defaultQueryTimeoutMs: undefined,
        });

        // Handle connection updates
        client.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                lastQr = qr;
                console.log('[WhatsApp] QR Code Generated!');
                console.log('[WhatsApp] Visit https://api.listup.ng/whatsapp/qr to scan');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error instanceof Boom)
                    ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut
                    : true;

                console.log('[WhatsApp] Connection closed. Reconnecting:', shouldReconnect);

                if (shouldReconnect) {
                    setTimeout(() => initWhatsApp(), 3000);
                }
            } else if (connection === 'open') {
                console.log('✅ WhatsApp Bot Connected!');
                lastQr = null;
            }
        });

        // Save credentials on update
        client.ev.on('creds.update', saveCreds);

        // Message Listener
        client.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type === 'notify') {
                for (const message of messages) {
                    if (!message.key.fromMe && !message.key.remoteJid.endsWith('@g.us')) {
                        const from = message.key.remoteJid;
                        const body = message.message?.conversation ||
                            message.message?.extendedTextMessage?.text || '';

                        console.log(`[WhatsApp] Incoming message from ${from}: "${body}"`);

                        try {
                            const { handleWhatsAppMessage } = require('../bot/bot-handlers');
                            console.log('[WhatsApp] Routing to bot-handlers...');
                            // Convert Baileys message to WPPConnect-like format for compatibility
                            const compatMessage = {
                                from: from,
                                body: body,
                                key: message.key,
                                pushName: message.pushName,
                                isGroupMsg: from.endsWith('@g.us')
                            };
                            await handleWhatsAppMessage(client, compatMessage);
                            console.log('[WhatsApp] Bot-handlers finished processing.');
                        } catch (err) {
                            console.error('[WhatsApp] [Bot Handlers Error]:', err);
                        }
                    }
                }
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
        const result = await client.sendMessage(jid, { text: body });
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
        const result = await client.sendMessage(jid, {
            image: { url: imageUrl },
            caption: caption
        });
        console.log(`[WhatsApp] Image sent to ${jid}. Result:`, result ? 'SUCCESS' : 'EMPTY');
        return result;
    } catch (error) {
        console.error(`[WhatsApp] Failed to send image to ${jid}:`, error);
        return null;
    }
}

/**
 * Send Buttons (using Poll as fallback)
 */
async function sendButtons(to, title, buttons, footer = 'Listup Assistant') {
    if (!client) return null;
    const jid = formatJid(to);
    console.log(`[WhatsApp] Attempting to send poll to ${jid}...`);

    try {
        // Use poll for compatibility
        return await client.sendMessage(jid, {
            poll: {
                name: title,
                values: buttons.map(b => b.text),
                selectableCount: 1
            }
        });
    } catch (error) {
        console.error(`[WhatsApp] Failed to send poll to ${jid}:`, error);
        // Fallback to plain text
        const buttonText = buttons.map((b, i) => `${i + 1}. ${b.text}`).join('\n');
        return await client.sendMessage(jid, { text: `${title}\n\n${buttonText}` });
    }
}

/**
 * Send List Message (fallback to text)
 */
async function sendListMessage(to, title, buttonText, sections, footer = 'Listup Assistant') {
    if (!client) return null;
    const jid = formatJid(to);
    try {
        // Baileys doesn't have direct list support in newer versions, fallback to text
        let message = `${title}\n\n`;
        sections.forEach(section => {
            message += `*${section.title}*\n`;
            section.rows.forEach((row, i) => {
                message += `${i + 1}. ${row.title}${row.description ? ' - ' + row.description : ''}\n`;
            });
            message += '\n';
        });
        return await client.sendMessage(jid, { text: message });
    } catch (error) {
        console.error(`[WhatsApp] Failed to send list to ${jid}:`, error);
        return await client.sendMessage(jid, { text: `${title}\n\n(Menu failed to load, please type HELP)` });
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
