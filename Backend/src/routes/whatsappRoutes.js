const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

// Webhook for incoming messages
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.webhook);

module.exports = router;
