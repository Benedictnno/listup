const router = require('express').Router();
const { body } = require('express-validator');
const passport = require('passport');
const AuthCtrl = require('../controllers/auth.controller');

// USER or VENDOR registration
router.post(
  '/register',
  [
    // Basic user validation
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    
    body('phone')
      .optional()
      .customSanitizer(value => {
        // Convert empty string to undefined so it's truly optional
        return value === '' ? undefined : value;
      })
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage('Phone number must be between 10 and 15 characters'),
    
    body('role')
      .optional()
      .isIn(['USER', 'VENDOR'])
      .withMessage('Role must be either USER or VENDOR'),
    
    // Vendor-specific validation (only if role is VENDOR)
    body('storeName')
      .if(body('role').equals('VENDOR'))
      .trim()
      .notEmpty()
      .withMessage('Store name is required for vendor accounts')
      .isLength({ min: 2, max: 100 })
      .withMessage('Store name must be between 2 and 100 characters'),
    
    body('storeAddress')
      .if(body('role').equals('VENDOR'))
      .trim()
      .notEmpty()
      .withMessage('Store address is required for vendor accounts')
      .isLength({ min: 5, max: 200 })
      .withMessage('Store address must be between 5 and 200 characters'),
    
    body('businessCategory')
      .if(body('role').equals('VENDOR'))
      .trim()
      .notEmpty()
      .withMessage('Business category is required for vendor accounts')
      .isLength({ min: 2, max: 50 })
      .withMessage('Business category must be between 2 and 50 characters'),
  ],
  AuthCtrl.register
);

router.post('/login',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  passport.authenticate('local', { session: false }),
  AuthCtrl.login
);

// Password reset routes
router.post('/forgot-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],
  AuthCtrl.forgotPassword
);

router.post('/verify-reset-code',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be exactly 6 digits'),
  ],
  AuthCtrl.verifyResetCode
);

router.post('/reset-password',
  [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('Verification code must be exactly 6 digits'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  AuthCtrl.resetPassword
);

module.exports = router;
