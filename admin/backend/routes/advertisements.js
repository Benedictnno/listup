const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all advertisements (with pagination and filters)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'active') {
      where.isActive = true;
      where.expiryDate = { gte: new Date() };
    } else if (status === 'expired') {
      where.OR = [
        { isActive: false },
        { expiryDate: { lt: new Date() } }
      ];
    }

    const [advertisements, total] = await Promise.all([
      prisma.advertisement.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.advertisement.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        advertisements,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get advertisements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisements'
    });
  }
});

// Get single advertisement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await prisma.advertisement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!advertisement) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    res.json({
      success: true,
      data: { advertisement }
    });
  } catch (error) {
    console.error('Get advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement'
    });
  }
});

// Create new advertisement
router.post('/', [
  auth,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('imageUrl').trim().isURL().withMessage('Valid image URL is required'),
  body('targetUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Valid target URL required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
    .custom((value) => {
      const validDurations = [3, 7, 15, 31];
      if (!validDurations.includes(parseInt(value))) {
        throw new Error('Duration must be 3, 7, 15, or 31 days');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { title, imageUrl, targetUrl, duration } = req.body;
    
    // Calculate expiry date
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + parseInt(duration));

    const advertisement = await prisma.advertisement.create({
      data: {
        title,
        imageUrl,
        targetUrl: targetUrl && targetUrl.trim() ? targetUrl.trim() : null,
        duration: parseInt(duration),
        startDate,
        expiryDate,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: { advertisement }
    });
  } catch (error) {
    console.error('Create advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create advertisement'
    });
  }
});

// Update advertisement
router.put('/:id', [
  auth,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('imageUrl').optional().trim().isURL().withMessage('Valid image URL is required'),
  body('targetUrl').optional({ checkFalsy: true }).trim().isURL().withMessage('Valid target URL required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
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

    const { id } = req.params;
    const { title, imageUrl, targetUrl, isActive } = req.body;

    // Check if advertisement exists
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (targetUrl !== undefined) updateData.targetUrl = targetUrl && targetUrl.trim() ? targetUrl.trim() : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const advertisement = await prisma.advertisement.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: { advertisement }
    });
  } catch (error) {
    console.error('Update advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update advertisement'
    });
  }
});

// Delete advertisement
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if advertisement exists
    const existingAd = await prisma.advertisement.findUnique({
      where: { id }
    });

    if (!existingAd) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found'
      });
    }

    await prisma.advertisement.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Advertisement deleted successfully'
    });
  } catch (error) {
    console.error('Delete advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete advertisement'
    });
  }
});

// Track advertisement impression
router.post('/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.advertisement.update({
      where: { id },
      data: {
        impressions: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track impression'
    });
  }
});

// Track advertisement click
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.advertisement.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Click tracked'
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

// Get advertisement statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const now = new Date();

    const [totalAds, activeAds, expiredAds, totalImpressions, totalClicks] = await Promise.all([
      prisma.advertisement.count(),
      prisma.advertisement.count({
        where: {
          isActive: true,
          expiryDate: { gte: now }
        }
      }),
      prisma.advertisement.count({
        where: {
          OR: [
            { isActive: false },
            { expiryDate: { lt: now } }
          ]
        }
      }),
      prisma.advertisement.aggregate({
        _sum: {
          impressions: true
        }
      }),
      prisma.advertisement.aggregate({
        _sum: {
          clicks: true
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalAds,
        activeAds,
        expiredAds,
        totalImpressions: totalImpressions._sum.impressions || 0,
        totalClicks: totalClicks._sum.clicks || 0,
        clickThroughRate: totalImpressions._sum.impressions > 0
          ? ((totalClicks._sum.clicks || 0) / totalImpressions._sum.impressions * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('Get advertisement stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement statistics'
    });
  }
});

module.exports = router;
