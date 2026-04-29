const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');
const UpgradeCtrl = require('../controllers/upgrade.controller');
const { body } = require('express-validator');

router.get('/upgrade-to-vendor/check', generalLimiter, auth, UpgradeCtrl.checkUpgradeEligibility);

router.post(
  '/upgrade-to-vendor',
  generalLimiter,
  auth,
  allow('USER'),
  [
    body('storeName').trim().notEmpty().withMessage('Store name is required').isLength({ min: 2, max: 100 }),
    body('storeAddress').trim().notEmpty().withMessage('Store address is required').isLength({ min: 5, max: 200 }),
    body('businessCategory').trim().notEmpty().withMessage('Business category is required'),
    body('referralCode').optional().isString(),
  ],
  UpgradeCtrl.upgradeToVendor
);

module.exports = router;
