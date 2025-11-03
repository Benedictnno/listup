const { generalLimiter } = require('../middleware/rateLimiter');

const router = require('express').Router();

router.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));

router.use('/auth',generalLimiter, require('./auth.routes'));
router.use('/users',generalLimiter, require('./users.routes'));
router.use('/listings',generalLimiter, require('./listings.routes'));
router.use('/categories',generalLimiter, require('./categories.routes'));
router.use('/locations',generalLimiter, require('./locations.routes'));
router.use('/vendors',generalLimiter, require('./vendors.routes'));
router.use('/uploads',generalLimiter, require('./uploads.routes'));
router.use('/phone',generalLimiter, require('./phone.routes'));
router.use('/ads',generalLimiter, require('./ads.routes'));
router.use('/payments',generalLimiter, require('./payments.routes'));
router.use('/settings',generalLimiter, require('./settings.routes'));
router.use('/favourites',generalLimiter, require('./favourites.routes'));
router.use('/saved-searches',generalLimiter, require('./saved-searches.routes'));
router.use('/advertisements',generalLimiter, require('./advertisements.routes'));

module.exports = router;
