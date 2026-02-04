const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, allow } = require('../middleware/auth');

/**
 * Public: list all active addresses
 * Used by frontend signup and registration flows
 */
router.get('/', async (req, res) => {
    try {
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
        console.error('Error fetching addresses:', e);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

/**
 * Admin: list all addresses (including inactive ones)
 */
router.get('/admin', auth, allow('ADMIN'), async (req, res) => {
    try {
        if (!prisma || !prisma.Address) {
            console.error('Prisma client or Address model is undefined');
            return res.status(500).json({ error: 'Database connection error' });
        }

        const rows = await prisma.Address.findMany({ orderBy: { name: 'asc' } });
        res.json(rows);
    } catch (e) {
        console.error('Error fetching admin addresses:', e);
        res.status(500).json({ error: 'Failed to fetch addresses' });
    }
});

/**
 * Admin: create a new address
 */
router.post('/admin', auth, allow('ADMIN'), body('name').isString().isLength({ min: 2 }), async (req, res) => {
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
        console.error('Error creating address:', e);
        res.status(500).json({ error: 'Failed to create address' });
    }
});

/**
 * Admin: update an address
 */
router.patch('/admin/:id', auth, allow('ADMIN'), async (req, res) => {
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
        console.error('Error updating address:', e);
        res.status(500).json({ error: 'Failed to update address' });
    }
});

/**
 * Admin: delete an address
 */
router.delete('/admin/:id', auth, allow('ADMIN'), async (req, res) => {
    try {
        if (!prisma || !prisma.Address) {
            console.error('Prisma client or Address model is undefined');
            return res.status(500).json({ error: 'Database connection error' });
        }

        const { id } = req.params;
        await prisma.Address.delete({ where: { id } });
        res.status(204).send();
    } catch (e) {
        console.error('Error deleting address:', e);
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

module.exports = router;
