const router = require("express").Router();
const AdsCtrl = require("../controllers/ads.controller");
const { authenticate } = require("../middleware/auth");

// vendor only
router.post("/", authenticate, AdsCtrl.createAd);

// public
router.get("/active", AdsCtrl.getActiveAds);

module.exports = router;
