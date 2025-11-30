const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const ReferralCtrl = require('../controllers/referral.controller');
const { generalLimiter } = require('../middleware/rateLimiter');

// User routes
router.get('/my-code', generalLimiter, auth, ReferralCtrl.getMyReferralCode);
router.get('/my-stats', generalLimiter, auth, ReferralCtrl.getReferralStats);

// Public route (for signup validation)
router.get('/validate/:code', generalLimiter, ReferralCtrl.validateReferralCode);

// Admin routes
router.get('/admin/all', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.getAllReferrals);
router.patch('/admin/:id/active', generalLimiter, auth, allow('ADMIN'), ReferralCtrl.toggleReferralActive);

module.exports = router;
