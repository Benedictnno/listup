const whatsappService = require('../services/whatsappService');

exports.webhook = async (req, res) => {
    try {
        const { From, Body } = req.body;

        // Twilio webhooks are POST requests with form-urlencoded body usually, 
        // but body-parser handles JSON too. 
        // If From/Body are missing, it might be an issue with parser or request type.

        if (req.body.Body) {
            await whatsappService.handleIncomingMessage(From, req.body.Body);
        }

        // Respond with TwiML to satisfy Twilio (empty response prevents Twilio from complaining)
        res.set('Content-Type', 'text/xml');
        res.status(200).send('<Response></Response>');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Error processing message');
    }
};
