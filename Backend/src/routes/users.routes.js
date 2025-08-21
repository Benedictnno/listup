const router = require('express').Router();
const UsersCtrl = require('../controllers/users.controller');
const { auth } = require('../middleware/auth');

router.get('/me', auth, UsersCtrl.me);

module.exports = router;
// src/routes/users.routes.js