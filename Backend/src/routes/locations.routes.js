const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, allow } = require('../middleware/auth');

// Public: list active locations
router.get('/', async (req, res, next) => {
  try {
    const rows = await prisma.sellingLocation.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(rows);
  } catch (e) { next(e); }
});

// Admin: list all
router.get('/admin', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    const rows = await prisma.sellingLocation.findMany({ orderBy: { name: 'asc' } });
    res.json(rows);
  } catch (e) { next(e); }
});

// Admin: create
router.post('/admin', auth, allow('ADMIN'), body('name').isString().isLength({ min: 2 }), async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, active = true } = req.body;
    const row = await prisma.sellingLocation.create({ data: { name, active } });
    res.status(201).json(row);
  } catch (e) { next(e); }
});

// Admin: update
router.patch('/admin/:id', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const row = await prisma.sellingLocation.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name } : {}),
        ...(typeof active === 'boolean' ? { active } : {}),
      }
    });
    res.json(row);
  } catch (e) { next(e); }
});

// Admin: delete
router.delete('/admin/:id', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.sellingLocation.delete({ where: { id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;



