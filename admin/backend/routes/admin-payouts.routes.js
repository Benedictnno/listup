const router = require('express').Router();
const { auth } = require('../middleware/auth');
const AdminPayoutsCtrl = require('../lib/admin-payouts.controller');

// All admin-only (auth middleware already checks for ADMIN role)
router.get('/periods', auth, AdminPayoutsCtrl.getPayoutPeriods);
router.post('/lock-month', auth, AdminPayoutsCtrl.lockMonth);
router.get('/statements/:periodId', auth, AdminPayoutsCtrl.getStatements);
router.patch('/statements/:id/approve', auth, AdminPayoutsCtrl.approveStatement);
router.patch('/statements/:id/mark-paid', auth, AdminPayoutsCtrl.markPaid);

module.exports = router;
