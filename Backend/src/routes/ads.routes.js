const router = require("express").Router();
const AdsCtrl = require("../controllers/ads.controller");
const { auth } = require("../middleware/auth");
const { checkFeature } = require("../middleware/featureFlag");
const { generalLimiter } = require("../middleware/rateLimiter");

// create ad (draft)
router.post("/", generalLimiter, auth, checkFeature('listing_promotion'), AdsCtrl.createAd);

// get active ads (public)
router.get("/active", generalLimiter, checkFeature('listing_promotion'), AdsCtrl.getActiveAds);

// get all ads (for debugging - remove in production)
router.get("/all",generalLimiter, AdsCtrl.getAllAds);

// get vendor's ads
router.get("/vendor/:vendorId",generalLimiter, auth, AdsCtrl.getAdsByVendor);

// get specific ad by ID
router.get("/:adId", auth,generalLimiter, AdsCtrl.getAdById);

// update ad status
router.patch("/:adId/status",generalLimiter, auth, AdsCtrl.updateAdStatus);

module.exports = router;
