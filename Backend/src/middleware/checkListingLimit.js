const prisma = require('../lib/prisma');

/**
 * Middleware to check if vendor can create more listings
 * Unverified vendors: max 3 listings
 * Verified vendors: unlimited
 */
const checkListingLimit = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get user with listings count
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                listingLimit: true,
                isKYCVerified: true,
                vendorProfile: {
                    select: {
                        isVerified: true
                    }
                },
                _count: {
                    select: {
                        listings: {
                            where: { isActive: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // If vendor is verified, allow unlimited
        const isVerified = user.isKYCVerified || user.vendorProfile?.isVerified;
        if (isVerified) {
            return next();
        }

        // Check limit for unverified vendors
        const currentListings = user._count.listings;
        const limit = user.listingLimit || 3;

        if (currentListings >= limit) {
            return res.status(403).json({
                success: false,
                message: `Unverified vendors can only create ${limit} listings. Complete KYC verification to unlock unlimited listings.`,
                kycRequired: true,
                current: currentListings,
                limit: limit
            });
        }

        next();
    } catch (error) {
        console.error('Listing limit check error:', error);
        next(error);
    }
};

module.exports = { checkListingLimit };
