const express = require('express');
const router = express.Router();
const { auth, allow } = require('../middleware/auth');
const { checkFeature } = require('../middleware/featureFlag');
const kycController = require('../controllers/kyc.controller');

// Submit KYC
router.post('/submit', auth, checkFeature('kyc_system'), kycController.submitKYC);

// Get user's KYC status
router.get('/status', auth, checkFeature('kyc_system'), kycController.getKYCStatus);

// Admin: Get all KYC submissions
router.get('/admin/submissions', auth, allow('ADMIN'), kycController.getAllKYCSubmissions);

// Admin: Update KYC status
router.patch('/admin/:id/status', auth, allow('ADMIN'), kycController.updateKYCStatus);

// Admin: Mark payment received (triggers commission logic)
router.post('/admin/:id/payment', auth, allow('ADMIN'), kycController.processKYCPayment);

module.exports = router;
 