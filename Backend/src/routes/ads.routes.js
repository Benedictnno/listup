const router = require("express").Router();
const AdsCtrl = require("../controllers/ads.controller");
const { auth } = require("../middleware/auth");

// create ad (draft)
router.post("/", auth, AdsCtrl.createAd);

// get active ads (public)
router.get("/active", AdsCtrl.getActiveAds);

// get all ads (for debugging - remove in production)
router.get("/all", AdsCtrl.getAllAds);

// get vendor's ads
router.get("/vendor/:vendorId", auth, AdsCtrl.getAdsByVendor);

// get specific ad by ID
router.get("/:adId", auth, AdsCtrl.getAdById);

// update ad status
router.patch("/:adId/status", auth, AdsCtrl.updateAdStatus);

module.exports = router;
