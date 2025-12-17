const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all feature flags
router.get('/', auth, async (req, res) => {
    try {
        const flags = await prisma.featureFlag.findMany();
        // Return array directly might be easier for admin table
        res.json({
            success: true,
            data: flags
        });
    } catch (error) {
        console.error('Error fetching feature flags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feature flags'
        });
    }
});

// Update a feature flag
router.post('/upsert', auth, [
    body('key').notEmpty().withMessage('Key is required'),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const { key, isEnabled, description } = req.body;

        const flag = await prisma.featureFlag.upsert({
            where: { key },
            update: {
                isEnabled,
                description
            },
            create: {
                key,
                isEnabled: isEnabled || false,
                description
            }
        });

        res.json({
            success: true,
            message: 'Feature flag updated successfully',
            data: flag
        });
    } catch (error) {
        console.error('Error updating feature flag:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update feature flag'
        });
    }
});

module.exports = router;
