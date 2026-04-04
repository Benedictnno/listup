const router = require('express').Router();
const ctrl = require('../controllers/recommendations.controller');
const { auth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/trending', generalLimiter, ctrl.getTrending);
router.get('/for-you', generalLimiter, auth, ctrl.getForYou);

module.exports = router;
