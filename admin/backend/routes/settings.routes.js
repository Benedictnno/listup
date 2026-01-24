const router = require('express').Router();
const { auth } = require('../middleware/auth');
const PartnerAnalyticsCtrl = require('../lib/partner-analytics.controller');

// System Settings
router.get('/rewards', auth, PartnerAnalyticsCtrl.getSettings);
router.put('/rewards', auth, PartnerAnalyticsCtrl.updateSettings);

module.exports = router;
