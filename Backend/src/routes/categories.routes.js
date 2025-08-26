const router = require('express').Router();
const { auth, allow } = require('../middleware/auth');
const CategoriesCtrl = require('../controllers/categories.controller');
const { body } = require('express-validator');

router.get('/', CategoriesCtrl.list);
router.post('/',
  // auth, allow('admin'),
  body('name').isString().isLength({ min: 2 }),
  body('slug').isString().isLength({ min: 2 }),
  CategoriesCtrl.create
);

// Add seed route for categories
router.post('/seed', CategoriesCtrl.seed);

// Add update and delete routes
router.put('/:id',
  body('name').isString().isLength({ min: 2 }),
  body('slug').isString().isLength({ min: 2 }),
  CategoriesCtrl.update
);

router.delete('/:id', CategoriesCtrl.delete);

module.exports = router;
