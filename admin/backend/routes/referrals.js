const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all commissions
router.get('/admin/commissions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const take = Math.min(parseInt(limit), 50);
        const skip = (Math.max(parseInt(page), 1) - 1) * take;

        // Build where clause
        const where = {};

        if (status && status !== 'ALL') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                // Search referrer
                { referral: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { referral: { user: { email: { contains: search, mode: 'insensitive' } } } },
                // Search referred vendor
                { vendor: { name: { contains: search, mode: 'insensitive' } } },
                { vendor: { email: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Fetch commissions with related data
        // Note: Using CommissionPayment model if it exists, otherwise ReferralUse
        // Based on previous context, we likely have a CommissionPayment model or similar

        // Let's check schema first, but assuming structure based on KYC work
        // If CommissionPayment doesn't exist, we might need to query ReferralUse

        // For now, let's try to query ReferralUse which definitely exists
        const [commissions, total] = await Promise.all([
            prisma.referralUse.findMany({
                where,
                skip,
                take,
                include: {
                    referral: {
                        include: {
                            user: { // The referrer
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    },
                    vendor: { // The referred user (new vendor)
                        select: {
                            id: true,
                            name: true,
                            email: true,
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
            prisma.referralUse.count({ where })
        ]);

        // Transform data for frontend
        const formattedCommissions = commissions.map(comm => ({
            id: comm.id,
            referrer: {
                name: comm.referral.user.name,
                email: comm.referral.user.email
            },
            referredUser: {
                name: comm.vendor.name,
                storeName: comm.vendor.vendorProfile?.storeName || 'N/A'
            },
            amount: comm.commission || 1000, // Default if null
            status: comm.status || 'PENDING', // Default if null
            createdAt: comm.createdAt
        }));

        res.json({
            success: true,
            data: {
                commissions: formattedCommissions,
                total,
                page: Number(page),
                limit: take
            }
        });

    } catch (error) {
        console.error('Get commissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching commissions'
        });
    }
});

// Get all referrals
router.get('/admin/all', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search } = req.query;
        const take = Math.min(parseInt(limit), 50);
        const skip = (Math.max(parseInt(page), 1) - 1) * take;

        const where = {};

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } }
            ];
        }

        const [referrals, total] = await Promise.all([
            prisma.referral.findMany({
                where,
                skip,
                take,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
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
                                            storeName: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.referral.count({ where })
        ]);

        const formattedReferrals = referrals.map(ref => ({
            id: ref.id,
            code: ref.code,
            referrer: {
                name: ref.user.name,
                email: ref.user.email
            },
            totalReferrals: ref.totalReferrals,
            successfulReferrals: ref.successfulReferrals,
            totalEarnings: ref.totalEarnings,
            isActive: ref.isActive,
            createdAt: ref.createdAt,
            user: ref.user,
            referredVendors: ref.referredVendors.map(rv => ({
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
                updatedAt: rv.updatedAt
            }))
        }));

        res.json({
            success: true,
            data: {
                referrals: formattedReferrals,
                total,
                page: Number(page),
                limit: take
            }
        });

    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching referrals'
        });
    }
});

module.exports = router;
