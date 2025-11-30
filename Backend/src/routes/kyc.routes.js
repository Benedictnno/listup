const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const KYCCtrl = require('../controllers/kyc.controller');
const { generalLimiter } = require('../middleware/rateLimiter');

// Vendor routes
router.post('/submit', generalLimiter, auth, allow('VENDOR'), KYCCtrl.submitKYC);
router.get('/status', generalLimiter, auth, allow('VENDOR'), KYCCtrl.getKYCStatus);

// Admin routes
router.get('/admin/submissions', generalLimiter, auth, allow('ADMIN'), KYCCtrl.getAllKYCSubmissions);
router.patch('/admin/:id/status', generalLimiter, auth, allow('ADMIN'), KYCCtrl.updateKYCStatus);
router.post('/admin/:id/payment', generalLimiter, auth, allow('ADMIN'), KYCCtrl.processKYCPayment);

module.exports = router;
