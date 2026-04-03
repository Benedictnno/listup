const router = require('express').Router();
const FeatureCtrl = require('../controllers/feature.controller');
const { auth, allow } = require('../middleware/auth');

// Get all flags (Publicly accessible so frontend can read them)
router.get('/', FeatureCtrl.getFlags);

// Update/Create flag (Admin only)
router.post('/', auth, allow('ADMIN'), FeatureCtrl.upsertFlag);

module.exports = router;
