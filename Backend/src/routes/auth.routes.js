const router = require('express').Router();
const { body } = require('express-validator');
const passport = require('passport');
const AuthCtrl = require('../controllers/auth.controller');

// USER or VENDOR registration
router.post(
  '/register',
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['USER','VENDOR']),
  body('phone').optional().isMobilePhone('any'),
  // vendor-specific validation
  body('storeName').if(body('role').equals('VENDOR')).isString().isLength({ min: 2 }),
  body('storeAddress').if(body('role').equals('VENDOR')).isString().isLength({ min: 5 }),
  body('businessCategory').if(body('role').equals('VENDOR')).isString().isLength({ min: 2 }),
  body('coverImage').if(body('role').equals('VENDOR')).isString().isURL(),
  AuthCtrl.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  passport.authenticate('local', { session: false }),
  AuthCtrl.login
);

module.exports = router;
