const router = require('express').Router();
const { auth } = require('../middleware/auth');
const PartnerAnalyticsCtrl = require('../lib/partner-analytics.controller');

// All admin-only (auth middleware already checks for ADMIN role)
router.post('/create', auth, PartnerAnalyticsCtrl.createPartner);
router.get('/overview', auth, PartnerAnalyticsCtrl.getPartnersOverview);
router.get('/activity-feed', auth, PartnerAnalyticsCtrl.getActivityFeed);
router.get('/leaderboard', auth, PartnerAnalyticsCtrl.getLeaderboard);
router.get('/:partnerId/details', auth, PartnerAnalyticsCtrl.getPartnerDetails);
router.patch('/:partnerId/toggle-active', auth, PartnerAnalyticsCtrl.togglePartnerActive);
router.patch('/referral-use/:id/flag-fraud', auth, PartnerAnalyticsCtrl.flagFraud);

module.exports = router;
