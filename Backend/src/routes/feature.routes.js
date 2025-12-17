const router = require('express').Router();
const FeatureCtrl = require('../controllers/feature.controller');

// Get all flags (Publicly accessible so frontend can read them)
router.get('/', FeatureCtrl.getFlags);

// Update/Create flag (Should be protected in prod, but keeping open as per implied simpler scope or add auth later)
// Adding minimal auth middleware if available typically, but for now open or consistent with plan.
// Let's at least expect it to be an admin function in real life.
router.post('/', FeatureCtrl.upsertFlag);

module.exports = router;
