const router = require("express").Router();
const VendorsCtrl = require("../controllers/vendors.controller");

// public route
router.get("/:id", VendorsCtrl.getVendorProfile);

module.exports = router;

