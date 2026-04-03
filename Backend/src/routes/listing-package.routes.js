// routes/listing-package.routes.js
// Admin-facing routes for managing listing package pricing.
const express = require('express');
const router = express.Router();
const { auth, allow } = require('../middleware/auth');
const ctrl = require('../controllers/listing-package.controller');

// All routes require authentication and ADMIN role
router.use(auth, allow('ADMIN'));

// ── Global settings ───────────────────────────────────────────────────────────
// GET  /admin/listing-packages/settings       → view global price/count
// PUT  /admin/listing-packages/settings       → update global price/count
router.get('/settings', ctrl.getGlobalSettings);
router.put('/settings', ctrl.updateGlobalSettings);

// ── Per-vendor overrides ──────────────────────────────────────────────────────
// GET   /admin/listing-packages/vendors/:vendorId   → view vendor's effective pricing
// PATCH /admin/listing-packages/vendors/:vendorId   → set/clear vendor override
// POST  /admin/listing-packages/vendors/:vendorId/credit → manually credit slots
router.get('/vendors/:vendorId', ctrl.getVendorPackageOverride);
router.patch('/vendors/:vendorId', ctrl.setVendorPackageOverride);
router.post('/vendors/:vendorId/credit', ctrl.creditVendorSlots);

module.exports = router;
