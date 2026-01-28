const whatsappService = require('../services/whatsapp.service');

/**
 * Get QR Code
 */
const getQr = async (req, res) => {
    const qr = whatsappService.getQr();
    if (!qr) {
        return res.json({ success: false, message: 'QR Code not available yet. Please wait or check if already connected.' });
    }

    // Serve as HTML for easy viewing
    res.send(`
        <html>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
                <h1>Scan this QR with WhatsApp</h1>
                <img src="${qr}" alt="WhatsApp QR Code" />
                <p>Status: Waiting for scan...</p>
                <script>setTimeout(() => window.location.reload(), 10000);</script>
            </body>
        </html>
    `);
};

/**
 * Check Bot Status
 */
const getBotStatus = async (req, res) => {
    const client = whatsappService.getClient();
    if (!client) {
        return res.json({ success: false, status: 'DISCONNECTED', message: 'Bot client not initialized' });
    }

    try {
        const isConnected = await client.isConnected();
        res.json({
            success: true,
            status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
            session: 'listup-bot'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Send Manual Message (Admin)
 */
const sendManualMessage = async (req, res) => {
    const { to, message } = req.body;
    if (!to || !message) {
        return res.status(400).json({ success: false, message: 'Recipient and message are required' });
    }

    try {
        const result = await whatsappService.sendMessage(to, message);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Diagnostic Send
 */
const testSend = async (req, res) => {
    const { to, message } = req.query;
    if (!to || !message) {
        return res.status(400).json({ success: false, message: 'Missing to or message query params' });
    }
    try {
        const result = await whatsappService.sendMessage(to, message);
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Legacy Webhook
 */
const webhook = async (req, res) => {
    res.status(200).send('WPPConnect bot uses internal listeners, not webhooks.');
};

module.exports = {
    getQr,
    getBotStatus,
    sendManualMessage,
    testSend,
    webhook
};
