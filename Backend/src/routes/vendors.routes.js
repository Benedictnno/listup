const router = require("express").Router();
const VendorsCtrl = require("../controllers/vendors.controller");
const { auth } = require("../middleware/auth");
const { generalLimiter } = require("../middleware/rateLimiter");

// protected route - update vendor profile
router.put("/profile", generalLimiter, auth, VendorsCtrl.updateVendorProfile);

// public route
router.get("/:id", generalLimiter, VendorsCtrl.getVendorProfile);

module.exports = router;

