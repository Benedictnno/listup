const router = require("express").Router();
const PayCtrl = require("../controllers/payments.controller");

// vendor init payment
router.post("/init", PayCtrl.initPayment);

// webhook
router.post("/webhook", PayCtrl.paystackWebhook);

module.exports = router;
// src/routes/payments.routes.js