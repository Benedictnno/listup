const router = require("express").Router();
const { auth, allow } = require("../middleware/auth");
const ListingsCtrl = require("../controllers/listings.controller");
const KYCCtrl = require("../controllers/kyc.controller");
const { body } = require("express-validator");
const { generalLimiter } = require("../middleware/rateLimiter");
const { auditLog } = require("../middleware/audit.middleware");

router.get("/", generalLimiter, ListingsCtrl.getAll);
router.get("/search", generalLimiter, ListingsCtrl.search);

// Public endpoint to view vendor listings (no authentication required)
router.get(
  "/vendors/:vendorId/public",
  generalLimiter,
  ListingsCtrl.getPublicVendorListings,
);

// Public endpoint to view vendor listings by store name (more user-friendly)
router.get(
  "/stores/:storeName",
  generalLimiter,
  ListingsCtrl.getVendorListingsByStore,
);

router.get(
  "/vendors/:vendorId/listings",
  generalLimiter,
  auth,
  allow("VENDOR"),
  ListingsCtrl.getByVendorId,
);

// Phase 1: Content-Based Filtering
router.get("/:id/similar", generalLimiter, ListingsCtrl.getSimilarListings);

// Generic :id route
router.get("/:id", generalLimiter, ListingsCtrl.getOne);

// 👇 only VENDORs can create listings
router.post(
  "/",
  generalLimiter,
  auth,
  allow("VENDOR"),
  auditLog("CREATE_LISTING", "LISTING"),
  KYCCtrl.checkListingLimit,
  body("title").isString().isLength({ min: 3 }),
  body("price").isFloat({ gt: 0 }),
  body("categoryId").isString(),
  ListingsCtrl.create,
);

// 👇 only vendor that owns the listing can update/delete
router.patch(
  "/:id",
  generalLimiter,
  auth,
  allow("VENDOR"),
  auditLog("UPDATE_LISTING", "LISTING"),
  ListingsCtrl.update,
);
router.delete(
  "/:id",
  generalLimiter,
  auth,
  allow("VENDOR"),
  auditLog("DELETE_LISTING", "LISTING"),
  ListingsCtrl.remove,
);

module.exports = router;
