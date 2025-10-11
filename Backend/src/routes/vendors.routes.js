const router = require("express").Router();
const VendorsCtrl = require("../controllers/vendors.controller");
const { auth } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

// public route
router.get("/:id", generalLimiter, VendorsCtrl.getVendorProfile);

// protected route - update vendor profile
router.put("/profile",generalLimiter, auth, VendorsCtrl.updateVendorProfile);

module.exports = router;

