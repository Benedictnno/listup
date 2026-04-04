const router = require("express").Router();
const listingTiersController = require("../controllers/listing-tiers.controller");

router.get("/", listingTiersController.getAll);
router.get("/:id", listingTiersController.getById);

module.exports = router;
