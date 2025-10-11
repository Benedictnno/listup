const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const CategoriesCtrl = require('../controllers/categories.controller');
const { body } = require('express-validator');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/',generalLimiter, CategoriesCtrl.list);
// Protect category management: only ADMINs may create, seed, update or delete
router.post('/',generalLimiter,
  auth, allow('ADMIN'),
  body('name').isString().isLength({ min: 2 }),
  body('slug').isString().isLength({ min: 2 }),
  CategoriesCtrl.create
);

// Add seed route for categories (admin-only)
router.post('/seed',generalLimiter, auth, allow('ADMIN'), CategoriesCtrl.seed);

// Add update and delete routes (admin-only)
router.put('/:id',generalLimiter,
  auth, allow('ADMIN'),
  body('name').isString().isLength({ min: 2 }),
  body('slug').isString().isLength({ min: 2 }),
  CategoriesCtrl.update
);

router.delete('/:id',generalLimiter, auth, allow('ADMIN'), CategoriesCtrl.delete);

module.exports = router;
