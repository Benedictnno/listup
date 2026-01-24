const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const ReferralCtrl = require('../controllers/referral.controller');
const { generalLimiter } = require('../middleware/rateLimiter');

// User routes
router.get('/my-code', generalLimiter, auth, allow('VENDOR', 'USER', 'PARTNER'), ReferralCtrl.getMyReferralCode);
router.get('/my-stats', generalLimiter, auth, allow('VENDOR', 'USER', 'PARTNER'), ReferralCtrl.getReferralStats);
router.get('/partner/dashboard', generalLimiter, auth, allow('VENDOR', 'USER', 'PARTNER'), ReferralCtrl.getPartnerDashboardStats);

// Public route (for signup validation)
router.get('/validate/:code', generalLimiter, ReferralCtrl.validateReferralCode);

// Admin routes
router.get('/admin/all', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.getAllReferrals);
router.patch('/admin/:id/active', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.toggleReferralActive);
router.get('/admin/commissions', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.getAllCommissions);
router.patch('/admin/commissions/:id/pay', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.markCommissionPaid);

const ReferralTrackingCtrl = require('../controllers/referral-tracking.controller');

// Click Tracking Routes
router.get('/r/:code', generalLimiter, ReferralTrackingCtrl.handleRedirect);
router.post('/qualify', generalLimiter, ReferralTrackingCtrl.qualifyClick);
router.get('/leaderboard', generalLimiter, ReferralTrackingCtrl.getLeaderboard);

module.exports = router;
