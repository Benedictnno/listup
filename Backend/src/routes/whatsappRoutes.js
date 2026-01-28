const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
// const { isAdmin } = require('../middleware/auth'); // Optionally restrict these

router.get('/status', whatsappController.getBotStatus);
router.get('/qr', whatsappController.getQr);
router.get('/test-send', whatsappController.testSend);
router.post('/send-manual', whatsappController.sendManualMessage);
router.post('/webhook', whatsappController.webhook);

module.exports = router;
