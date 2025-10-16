const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, allow } = require('../middleware/auth');

// Public: list active locations
router.get('/', async (req, res, next) => {
  try {
    // Verify prisma client is properly initialized
    if (!prisma || !prisma.Address) {
      console.error('Prisma client or Address model is undefined');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const rows = await prisma.Address.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(rows);
  } catch (e) { 
    console.error('Error fetching locations:', e);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Admin: list all
router.get('/admin', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    if (!prisma || !prisma.Address) {
      console.error('Prisma client or Address model is undefined');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const rows = await prisma.Address.findMany({ orderBy: { name: 'asc' } });
    res.json(rows);
  } catch (e) {
    console.error('Error fetching admin locations:', e);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Admin: create
router.post('/admin', auth, allow('ADMIN'), body('name').isString().isLength({ min: 2 }), async (req, res, next) => {
  try {
    if (!prisma || !prisma.Address) {
      console.error('Prisma client or Address model is undefined');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, active = true } = req.body;
    const row = await prisma.Address.create({ data: { name, active } });
    res.status(201).json(row);
  } catch (e) {
    console.error('Error creating location:', e);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Admin: update
router.patch('/admin/:id', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    if (!prisma || !prisma.Address) {
      console.error('Prisma client or Address model is undefined');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const { id } = req.params;
    const { name, active } = req.body;
    const row = await prisma.Address.update({
      where: { id },
      data: {
        ...(typeof name === 'string' ? { name } : {}),
        ...(typeof active === 'boolean' ? { active } : {}),
      }
    });
    res.json(row);
  } catch (e) {
    console.error('Error updating location:', e);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Admin: delete
router.delete('/admin/:id', auth, allow('ADMIN'), async (req, res, next) => {
  try {
    if (!prisma || !prisma.Address) {
      console.error('Prisma client or Address model is undefined');
      return res.status(500).json({ error: 'Database connection error' });
    }
    
    const { id } = req.params;
    await prisma.Address.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting location:', e);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

module.exports = router;



