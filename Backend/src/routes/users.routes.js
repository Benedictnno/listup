const router = require('express').Router();
const UsersCtrl = require('../controllers/users.controller');
const { auth } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/me', generalLimiter, auth, UsersCtrl.me);
router.get('/profile', generalLimiter, auth, UsersCtrl.getUserProfile);
router.put('/profile', generalLimiter, auth, UsersCtrl.updateUserProfile);
// router.put('/password',generalLimiter, auth, UsersCtrl.updatePassword);

module.exports = router;