const router = require('express').Router();
const UsersCtrl = require('../controllers/users.controller');
const { auth } = require('../middleware/auth');

router.get('/me', auth, UsersCtrl.me);
router.get('/profile', auth, UsersCtrl.getUserProfile);
router.put('/profile', auth, UsersCtrl.updateUserProfile);

module.exports = router;