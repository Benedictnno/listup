const prisma = require('../lib/prisma');

// Get all feature flags
exports.getFlags = async (req, res) => {
    try {
        const flags = await prisma.featureFlag.findMany();

        // Convert array to object for easier frontend consumption: { "key": true/false }
        const flagsMap = flags.reduce((acc, flag) => {
            acc[flag.key] = flag.isEnabled;
            return acc;
        }, {});

        res.json({
            success: true,
            data: flagsMap
        });
    } catch (error) {
        console.error('Error fetching feature flags:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feature flags'
        });
    }
};

// Create or update a feature flag (Admin only usually, but open for now as requested)
exports.upsertFlag = async (req, res) => {
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
                ...(description && { description })
            },
            create: {
                key,
                isEnabled: isEnabled || false,
                description
            }
        });

        res.json({
            success: true,
            message: `Feature flag '${key}' updated`,
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
