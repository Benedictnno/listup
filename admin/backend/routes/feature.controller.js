const prisma = require('../lib/prisma');

// Get all feature flags
exports.getFlags = async (req, res) => {
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
};

// Update a feature flag
exports.updateFlag = async (req, res) => {
    try {
        const { key, isEnabled, description } = req.body;

        if (!key) {
            return res.status(400).json({
                success: false,
                message: 'Flag key is required'
            });
        }

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
};
