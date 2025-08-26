const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const ListingsCtrl = require('../controllers/listings.controller');
const { body } = require('express-validator');


router.get("/", ListingsCtrl.getAll);
router.get('/search', ListingsCtrl.search);
router.get('/:id', ListingsCtrl.getOne);


router.get("/vendors/:vendorId/listings", auth, allow('VENDOR'), ListingsCtrl.getByVendorId);
// 👇 only VENDORs can create listings
router.post('/',
  auth, allow('VENDOR'),
  body('title').isString().isLength({ min: 3 }),
  body('price').isFloat({ gt: 0 }),
  body('categoryId').isString(),
  ListingsCtrl.create
);

// 👇 only vendor that owns the listing can update/delete
router.patch('/:id', auth, allow('VENDOR'), ListingsCtrl.update);
router.delete('/:id', auth, allow('VENDOR'), ListingsCtrl.remove);

module.exports = router;
