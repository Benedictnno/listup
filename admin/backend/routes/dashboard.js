const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard overview statistics
router.get('/overview', auth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalVendors,
      totalListings,
      totalAds,
      pendingVendors,
      recentUsers,
      recentListings,
      activeAds
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total vendors
      prisma.user.count({
        where: {
          role: 'VENDOR',
          vendorProfile: { isNot: null }
        }
      }),

      // Total listings
      prisma.listing.count(),

      // Total ads
      prisma.ad.count(),

      // Pending vendor approvals
      prisma.vendorProfile.count({
        where: { verificationStatus: 'PENDING' }
      }),

      // Recent users (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Recent listings (last 30 days)
      prisma.listing.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Active ads
      prisma.ad.count({
        where: {
          status: 'ACTIVE',
          paymentStatus: 'SUCCESS',
          startDate: { lte: new Date() },
          endDate: { gte: new Date() }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalVendors,
          totalListings,
          totalAds,
          pendingVendors,
          recentUsers,
          recentListings,
          activeAds
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// Get recent activity
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const take = Math.min(parseInt(limit), 50);

    const [
      recentUsers,
      recentListings,
      recentVendors,
      recentAds
    ] = await Promise.all([
      prisma.user.findMany({
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.listing.findMany({
        take,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          createdAt: true,
          seller: {
            select: {
              id: true,
              name: true,
              vendorProfile: {
                select: {
                  storeName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.user.findMany({
        where: {
          role: 'VENDOR',
          vendorProfile: { isNot: null }
        },
        take,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          vendorProfile: {
            select: {
              storeName: true,
              verificationStatus: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.ad.findMany({
        take,
        select: {
          id: true,
          type: true,
          status: true,
          paymentStatus: true,
          amount: true,
          createdAt: true,
          vendor: {
            select: {
              id: true,
              name: true,
              vendorProfile: {
                select: {
                  storeName: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    res.json({
      success: true,
      data: {
        recentUsers,
        recentListings,
        recentVendors,
        recentAds
      }
    });

  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activity'
    });
  }
});

// Get analytics data for charts
router.get('/analytics', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch daily user registrations and listings within the period
    const [users, listings] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true }
      }),
      prisma.listing.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true }
      })
    ]);

    // Helper function to group by date
    const groupByDate = (items) => {
      const counts = {};
      items.forEach(item => {
        const date = item.createdAt.toISOString().split('T')[0];
        counts[date] = (counts[date] || 0) + 1;
      });

      // Fill in gaps for the selected period
      const result = [];
      for (let i = 0; i <= days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        result.push({
          date: dateStr,
          count: counts[dateStr] || 0
        });
      }
      return result.reverse();
    };

    const dailyUsers = groupByDate(users);
    const dailyListings = groupByDate(listings);

    // Get category distribution
    const categoryDistribution = await prisma.listing.groupBy({
      by: ['categoryId'],
      _count: { id: true },
      where: { categoryId: { not: null } }
    });

    // Get category names
    const categoryIds = categoryDistribution.map(item => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true }
    });

    const categoryStats = categoryDistribution.map(item => ({
      categoryId: item.categoryId,
      count: item._count.id,
      categoryName: categories.find(cat => cat.id === item.categoryId)?.name || 'Unknown'
    }));

    res.json({
      success: true,
      data: {
        dailyUsers,
        dailyListings,
        categoryDistribution: categoryStats
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics data'
    });
  }
});

// Get system health
router.get('/health', auth, async (req, res) => {
  try {
    const [
      userCount,
      listingCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count()
    ]);

    res.json({
      success: true,
      data: {
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        metrics: {
          users: userCount,
          listings: listingCount
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'System health check failed',
      error: error.message
    });
  }
});

module.exports = router;
