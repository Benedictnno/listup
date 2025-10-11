const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const ListingsCtrl = require('../controllers/listings.controller');
const { body } = require('express-validator');
const { generalLimiter } = require('../middleware/rateLimiter');


router.get("/", generalLimiter, ListingsCtrl.getAll);
router.get('/search', generalLimiter, ListingsCtrl.search);
router.get('/:id', generalLimiter, ListingsCtrl.getOne);

// Public endpoint to view vendor listings (no authentication required)
router.get("/vendors/:vendorId/public",generalLimiter, ListingsCtrl.getPublicVendorListings);

// Public endpoint to view vendor listings by store name (more user-friendly)
router.get("/stores/:storeName",generalLimiter, ListingsCtrl.getVendorListingsByStore);


router.get("/vendors/:vendorId/listings",generalLimiter, auth, allow('VENDOR'), ListingsCtrl.getByVendorId);
// 👇 only VENDORs can create listings
router.post('/',generalLimiter,
  auth, allow('VENDOR'),
  body('title').isString().isLength({ min: 3 }),
  body('price').isFloat({ gt: 0 }),
  body('categoryId').isString(),
  ListingsCtrl.create
);

// 👇 only vendor that owns the listing can update/delete
router.patch('/:id',generalLimiter, auth, allow('VENDOR'), ListingsCtrl.update);
router.delete('/:id',generalLimiter, auth, allow('VENDOR'), ListingsCtrl.remove);

module.exports = router;
