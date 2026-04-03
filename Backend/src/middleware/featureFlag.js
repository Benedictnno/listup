const prisma = require('../lib/prisma');

/**
 * Middleware to check if a feature flag is enabled.
 * Admins are always allowed through.
 * Non-admins receive 403 Forbidden if the feature is disabled.
 * 
 * @param {string} featureKey - The unique key of the feature flag to check.
 */
const checkFeature = (featureKey) => {
    return async (req, res, next) => {
        try {
            // Priority 1: Allow Admins always
            if (req.user && req.user.role === 'ADMIN') {
                return next();
            }

            // Priority 2: Check database status
            const flag = await prisma.featureFlag.findUnique({
                where: { key: featureKey }
            });

            // If flag is missing or disabled, block the request
            if (!flag || !flag.isEnabled) {
                return res.status(403).json({
                    success: false,
                    message: `This feature (${featureKey}) is currently disabled.`,
                    code: 'FEATURE_DISABLED'
                });
            }

            next();
        } catch (error) {
            console.error(`Error checking feature flag [${featureKey}]:`, error);
            // On error, default to fail-closed for safety
            res.status(500).json({
                success: false,
                message: 'Internal server error while checking feature availability'
            });
        }
    };
};

module.exports = { checkFeature };
