const router = require("express").Router();
const VendorsCtrl = require("../controllers/vendors.controller");
const { auth } = require("../middleware/auth");

// public route
router.get("/:id", VendorsCtrl.getVendorProfile);

// protected route - update vendor profile
router.put("/profile", auth, VendorsCtrl.updateVendorProfile);

module.exports = router;

