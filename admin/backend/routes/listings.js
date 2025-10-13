const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all listings with pagination and filters
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category, search } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    // Build where clause
    const where = {};

    // Filter by active status
    if (status && ['active', 'inactive'].includes(status)) {
      where.isActive = status === 'active';
    }

    // Filter by category
    if (category) {
      where.categoryId = category;
    }

    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          location: true,
          condition: true,
          isActive: true,
          boostScore: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: {
                select: {
                  storeName: true,
                  isVerified: true,
                  verificationStatus: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.listing.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / take),
          limit: take
        }
      }
    });

  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listings'
    });
  }
});

// Get single listing details
router.get('/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            vendorProfile: {
              select: {
                storeName: true,
                storeAddress: true,
                businessCategory: true,
                isVerified: true,
                verificationStatus: true
              }
            }
          }
        },
        favorites: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        Ad: {
          select: {
            id: true,
            type: true,
            status: true,
            paymentStatus: true,
            amount: true,
            startDate: true,
            endDate: true,
            createdAt: true
          }
        }
      }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    res.json({
      success: true,
      data: { listing }
    });

  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing'
    });
  }
});

// Toggle listing active status
router.patch('/:listingId/toggle-status', auth, async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const updatedListing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        isActive: !listing.isActive
      },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `Listing ${updatedListing.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { listing: updatedListing }
    });

  } catch (error) {
    console.error('Toggle listing status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating listing status'
    });
  }
});

// Delete listing
router.delete('/:listingId', auth, async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await prisma.listing.findUnique({
      where: { id: listingId }
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    await prisma.listing.delete({
      where: { id: listingId }
    });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });

  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting listing'
    });
  }
});

// Get listing statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [
      totalListings,
      activeListings,
      inactiveListings,
      recentListings,
      listingsByCategory
    ] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { isActive: true } }),
      prisma.listing.count({ where: { isActive: false } }),
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.listing.groupBy({
        by: ['categoryId'],
        _count: { id: true },
        where: { category: { isNot: null } }
      })
    ]);

    // Get category names for the groupBy results
    const categoryIds = listingsByCategory.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryStats = listingsByCategory.map(item => ({
      categoryId: item.categoryId,
      count: item._count.id,
      categoryName: categories.find(cat => cat.id === item.categoryId)?.name || 'Unknown'
    }));

    res.json({
      success: true,
      data: {
        totalListings,
        activeListings,
        inactiveListings,
        recentListings,
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get listing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching listing statistics'
    });
  }
});

module.exports = router;
