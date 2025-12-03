const crypto = require('crypto');
const prisma = require('../lib/prisma');

// Helper to build referral URL
function buildReferralUrl(code) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/signup?ref=${encodeURIComponent(code)}`;
}

// Generate personalized referral code NAME-HASH
function generateReferralCode(name) {
  const prefix = (name || 'USER').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'USER';
  const hash = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${hash}`;
}

exports.getMyReferralCode = async (req, res) => {
  try {
    const userId = req.user.id;

    let referral = await prisma.referral.findFirst({
      where: { userId, isActive: true },
      include: { referredVendors: true },
    });

    if (!referral) {
      let unique = false;
      let code;
      while (!unique) {
        code = generateReferralCode(req.user.name);
        const existing = await prisma.referral.findUnique({ where: { code } });
        if (!existing) unique = true;
      }

      referral = await prisma.referral.create({
        data: {
          code,
          userId,
        },
        include: { referredVendors: true },
      });
    }

    const referralUrl = buildReferralUrl(referral.code);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(referralUrl)}`;

    const pendingReferrals = referral.referredVendors.filter(r => r.status === 'PENDING').length;
    const completedReferrals = referral.referredVendors.filter(r => r.status === 'COMPLETED').length;
    const pendingEarnings = referral.referredVendors
      .filter(r => r.status === 'COMPLETED' && !r.commissionPaid)
      .reduce((sum, r) => sum + (r.commission || 0), 0);

    return res.json({
      success: true,
      data: {
        code: referral.code,
        referralUrl,
        qrCodeUrl,
        stats: {
          totalReferrals: referral.totalReferrals,
          successfulReferrals: referral.successfulReferrals,
          totalEarnings: referral.totalEarnings,
          pendingReferrals,
          completedReferrals,
          pendingEarnings,
        },
      },
    });
  } catch (error) {
    console.error('Error in getMyReferralCode:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch referral code' });
  }
};

exports.getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch referral and referredVendors, but NOT the vendor relation directly
    // to avoid "Field vendor is required to return data, got null instead" error
    // if a referenced User has been deleted.
    const referral = await prisma.referral.findFirst({
      where: { userId },
      include: {
        referredVendors: true,
      },
    });

    if (!referral) {
      return res.json({
        success: true,
        data: {
          stats: {
            totalReferrals: 0,
            successfulReferrals: 0,
            totalEarnings: 0,
            pendingReferrals: 0,
            completedReferrals: 0,
            pendingEarnings: 0,
          },
          referrals: [],
        },
      });
    }

    // Manually fetch the vendor details
    const vendorIds = referral.referredVendors.map(r => r.vendorId);
    const vendors = await prisma.user.findMany({
      where: {
        id: { in: vendorIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },
    });

    // Create a map for quick lookup
    const vendorMap = vendors.reduce((acc, v) => {
      acc[v.id] = v;
      return acc;
    }, {});

    const referrals = referral.referredVendors.map(r => {
      const vendor = vendorMap[r.vendorId];
      return {
        id: r.id,
        vendorId: r.vendorId,
        vendorName: vendor?.name || 'Unknown Vendor',
        vendorEmail: vendor?.email || null,
        vendorPhone: vendor?.phone || null,
        storeName: vendor?.vendorProfile?.storeName || null,
        status: r.status,
        commission: r.commission,
        commissionPaid: r.commissionPaid,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    const pendingReferrals = referrals.filter(r => r.status === 'PENDING').length;
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED').length;
    const pendingEarnings = referrals
      .filter(r => r.status === 'COMPLETED' && !r.commissionPaid)
      .reduce((sum, r) => sum + (r.commission || 0), 0);

    return res.json({
      success: true,
      data: {
        stats: {
          totalReferrals: referral.totalReferrals,
          successfulReferrals: referral.successfulReferrals,
          totalEarnings: referral.totalEarnings,
          pendingReferrals,
          completedReferrals,
          pendingEarnings,
        },
        referrals,
      },
    });
  } catch (error) {
    console.error('Error in getReferralStats:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch referral stats' });
  }
};

// Get all commission payments (admin only)
// Supports filtering by status: PENDING, SUCCESS, FAILED
exports.getAllCommissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const where = status ? { status } : {};

    const [total, commissions] = await Promise.all([
      prisma.commissionPayment.count({ where }),
      prisma.commissionPayment.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              vendorProfile: {
                select: {
                  storeName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        commissions,
      },
    });
  } catch (error) {
    console.error('Error in getAllCommissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch commissions',
    });
  }
};

// Mark a commission payment as paid (admin only)
// Records payment method and reference for audit trail
exports.markCommissionPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentReference } = req.body;

    const commission = await prisma.commissionPayment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: 'Commission payment not found',
      });
    }

    if (commission.status === 'SUCCESS') {
      return res.status(400).json({
        success: false,
        message: 'Commission has already been paid',
      });
    }

    const updated = await prisma.commissionPayment.update({
      where: { id },
      data: {
        status: 'SUCCESS',
        paymentMethod: paymentMethod || 'BANK_TRANSFER',
        paymentReference: paymentReference || `MANUAL_${Date.now()}`,
        paidAt: new Date(),
      },
    });

    console.log(`✅ Commission paid to ${commission.user.name}: ₦${commission.amount}`);

    return res.json({
      success: true,
      message: 'Commission marked as paid',
      data: updated,
    });
  } catch (error) {
    console.error('Error in markCommissionPaid:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark commission as paid',
    });
  }
};

exports.validateReferralCode = async (req, res) => {
  try {
    const { code } = req.params;

    const referral = await prisma.referral.findUnique({
      where: { code },
    });

    if (!referral || !referral.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or inactive referral code',
      });
    }

    return res.json({
      success: true,
      data: {
        code: referral.code,
        discountAmount: 2000,
        originalFee: 5000,
        discountedFee: 3000,
      },
    });
  } catch (error) {
    console.error('Error in validateReferralCode:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate referral code' });
  }
};

exports.getAllReferrals = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const [total, referrals] = await Promise.all([
      prisma.referral.count(),
      prisma.referral.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          referredVendors: {
            include: {
              vendor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                  vendorProfile: {
                    select: {
                      storeName: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mapped = referrals.map((ref) => ({
      id: ref.id,
      code: ref.code,
      isActive: ref.isActive,
      totalReferrals: ref.totalReferrals,
      successfulReferrals: ref.successfulReferrals,
      totalEarnings: ref.totalEarnings,
      createdAt: ref.createdAt,
      user: ref.user,
      referredVendors: ref.referredVendors.map((rv) => ({
        id: rv.id,
        vendorId: rv.vendorId,
        vendorName: rv.vendor?.name || null,
        vendorEmail: rv.vendor?.email || null,
        vendorPhone: rv.vendor?.phone || null,
        storeName: rv.vendor?.vendorProfile?.storeName || null,
        status: rv.status,
        commission: rv.commission,
        commissionPaid: rv.commissionPaid,
        createdAt: rv.createdAt,
        updatedAt: rv.updatedAt,
      })),
    }));

    return res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        referrals: mapped,
      },
    });
  } catch (error) {
    console.error('Error in getAllReferrals:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch referrals' });
  }
};

exports.toggleReferralActive = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updated = await prisma.referral.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    return res.json({
      success: true,
      data: {
        id: updated.id,
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error('Error in toggleReferralActive:', error);
    return res.status(500).json({ success: false, message: 'Failed to update referral status' });
  }
};
