const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const { auth, isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all vendors with pagination
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    // Build where clause
    const where = {
      role: 'VENDOR',
      vendorProfile: {
        isNot: null
      }
    };

    // Filter by verification status
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.vendorProfile = {
        ...where.vendorProfile,
        verificationStatus: status
      };
    }

    // Search by name or store name
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { vendorProfile: { storeName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [vendors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          vendorProfile: {
            select: {
              id: true,
              storeName: true,
              address: true,
              businessCategory: true,
              coverImage: true,
              logo: true,
              website: true,
              isVerified: true,
              verificationStatus: true,
              rejectionReason: true,
              verifiedAt: true,
              verifiedBy: true,
              createdAt: true,
              updatedAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        vendors,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / take),
          limit: take
        }
      }
    });

  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendors'
    });
  }
});

// Get single vendor details
router.get('/:vendorId', auth, async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { 
        id: vendorId,
        role: 'VENDOR'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
            storeDescription: true,
            storeAddress: true,
            businessCategory: true,
            coverImage: true,
            logo: true,
            website: true,
            isVerified: true,
            verificationStatus: true,
            rejectionReason: true,
            verifiedAt: true,
            verifiedBy: true,
            createdAt: true,
            updatedAt: true,
            businessHours: true,
            socialMedia: true,
            storeSettings: true
          }
        },
        listings: {
          select: {
            id: true,
            title: true,
            price: true,
            images: true,
            isActive: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        ads: {
          select: {
            id: true,
            type: true,
            status: true,
            paymentStatus: true,
            amount: true,
            startDate: true,
            endDate: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    res.json({
      success: true,
      data: { vendor }
    });

  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor'
    });
  }
});

// Approve vendor
router.patch('/:vendorId/approve', isAuthenticated, async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { 
        id: vendorId,
        role: 'VENDOR'
      },
      include: {
        vendorProfile: true
      }
    });

    if (!vendor || !vendor.vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor verification status
    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendor.vendorProfile.id },
      data: {
        isVerified: true,
        verificationStatus: 'APPROVED',
        verifiedAt: new Date(),
        verifiedBy: req.user.id,
        rejectionReason: null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Vendor approved successfully',
      data: { vendor: updatedVendor }
    });

  } catch (error) {
    console.error('Approve vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving vendor'
    });
  }
});

// Reject vendor
router.patch('/:vendorId/reject', auth, [
  body('reason').notEmpty().withMessage('Rejection reason is required')
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

    const { vendorId } = req.params;
    const { reason } = req.body;

    const vendor = await prisma.user.findUnique({
      where: { 
        id: vendorId,
        role: 'VENDOR'
      },
      include: {
        vendorProfile: true
      }
    });

    if (!vendor || !vendor.vendorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Update vendor verification status
    const updatedVendor = await prisma.vendorProfile.update({
      where: { id: vendor.vendorProfile.id },
      data: {
        isVerified: false,
        verificationStatus: 'REJECTED',
        rejectionReason: reason,
        verifiedAt: new Date(),
        verifiedBy: req.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Vendor rejected successfully',
      data: { vendor: updatedVendor }
    });

  } catch (error) {
    console.error('Reject vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting vendor'
    });
  }
});

// Get vendor statistics
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [
      totalVendors,
      pendingVendors,
      approvedVendors,
      rejectedVendors,
      recentVendors
    ] = await Promise.all([
      prisma.user.count({
        where: { 
          role: 'VENDOR',
          vendorProfile: { isNot: null }
        }
      }),
      prisma.vendorProfile.count({
        where: { verificationStatus: 'PENDING' }
      }),
      prisma.vendorProfile.count({
        where: { verificationStatus: 'APPROVED' }
      }),
      prisma.vendorProfile.count({
        where: { verificationStatus: 'REJECTED' }
      }),
      prisma.user.count({
        where: {
          role: 'VENDOR',
          vendorProfile: { isNot: null },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        rejectedVendors,
        recentVendors
      }
    });

  } catch (error) {
    console.error('Get vendor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching vendor statistics'
    });
  }
});

module.exports = router;
