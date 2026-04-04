const { generalLimiter } = require('../middleware/rateLimiter');

const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/listings', require('./listings.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/locations', require('./locations.routes'));
router.use('/addresses', require('./addresses.routes'));
router.use('/vendors', require('./vendors.routes'));
router.use('/uploads', require('./uploads.routes'));
router.use('/phone', require('./phone.routes'));
router.use('/ads', require('./ads.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/settings', require('./settings.routes'));
router.use('/favourites', require('./favourites.routes'));
router.use('/saved-searches', require('./saved-searches.routes'));
router.use('/advertisements', require('./advertisements.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/referrals', require('./referral.routes'));
router.use('/kyc', require('./kyc.routes'));
router.use('/kyc-payment', require('./kyc-payment.routes'));
router.use('/features', require('./feature.routes'));
router.use('/whatsapp', require('./whatsappRoutes'));
router.use('/chat', require('./chat.routes'));
router.use('/admin/whatsapp', require('./whatsapp-analytics.routes'));
router.use('/listing-tiers', require('./listing-tiers.routes'));
router.use('/listing-topup', require('./listing-topup.routes'));
router.use('/recommendations', require('./recommendations.routes'));


module.exports = router;
