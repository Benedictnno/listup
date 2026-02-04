const whatsappService = require('../services/whatsappService');

/**
 * Meta Webhook verification (GET)
 */
exports.verifyWebhook = (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
};

/**
 * Handle incoming messages from Meta (POST)
 */
exports.webhook = async (req, res) => {
    try {
        const body = req.body;

        // Check if it's a WhatsApp message webhook
        if (body.object === 'whatsapp_business_account') {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Sender's phone number
                const msgBody = message.text ? message.text.body : null;

                if (msgBody) {
                    // Fire and forget handling to respond fast to Meta
                    whatsappService.handleIncomingMessage(from, msgBody).catch(err =>
                        console.error('Error handling incoming WPPS message:', err)
                    );
                }
            }
            // Meta expects a 200 OK for ALL webhooks
            return res.status(200).send('EVENT_RECEIVED');
        } else {
            // Not a WhatsApp event
            return res.sendStatus(404);
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Error processing event');
    }
};
