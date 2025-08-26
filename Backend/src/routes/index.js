const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/listings', require('./listings.routes'));
router.use('/categories', require('./categories.routes'));
router.use('/vendors', require('./vendors.routes'));
router.use('/uploads', require('./uploads.routes'));
router.use('/phone', require('./phone.routes'));
router.use('/ads', require('./ads.routes'));
router.use('/payments', require('./payments.routes'));
router.use('/settings', require('./settings.routes'));

module.exports = router;
