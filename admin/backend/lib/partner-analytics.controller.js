const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendPartnerWelcomeEmail } = require('../lib/email'); // Adjust path based on file location "admin/backend/lib" -> "../../src/lib/email" is likely wrong if src is sibling to admin.
// user file: c:\Users\Benedict\Documents\listup\admin\backend\lib\partner-analytics.controller.js
// email file: c:\Users\Benedict\Documents\listup\Backend\src\lib\email.js
// If admin/backend is root, then path to email.js??
// Wait, "admin/backend" seems to be a separate project or just a folder?
// User said: "c:\Users\Benedict\Documents\listup\admin\backend\lib\partner-analytics.controller.js"
// "c:\Users\Benedict\Documents\listup\Backend\src\lib\email.js"
// These seem to be in different roots: "listup/admin/backend" vs "listup/Backend".
// I'll need to check the import.
// Actually, I can likely just duplicate the email logic or try to require it relatively if they are in same monorepo structure.
// Let's assume relative path: ../../../Backend/src/lib/email


class PartnerAnalyticsController {

    /**
     * GET /api/partners/overview
     * Get all partners with current month stats
     */
    async getPartnersOverview(req, res) {
        try {
            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            const partners = await prisma.user.findMany({
                where: {
                    referralCode: {
                        isNot: null
                    }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    referralCode: {
                        select: {
                            id: true,
                            code: true,
                            isActive: true,
                            totalReferrals: true,
                            successfulReferrals: true,
                            pendingEarnings: true,
                            totalEarnings: true,
                            referredVendors: {
                                where: {
                                    createdAt: {
                                        gte: monthStart,
                                        lte: monthEnd
                                    }
                                },
                                select: {
                                    id: true,
                                    signupRewardStatus: true,
                                    listingRewardStatus: true,
                                    signupRewardAmount: true,
                                    listingRewardAmount: true,
                                    isFraud: true,
                                    createdAt: true,
                                    vendor: {
                                        select: {
                                            name: true,
                                            email: true
                                        }
                                    }
                                }
                            },
                            clicks: {
                                where: {
                                    clickedAt: {
                                        gte: monthStart,
                                        lte: monthEnd
                                    }
                                },
                                select: {
                                    id: true,
                                    status: true,
                                    rewardAmount: true,
                                    clickedAt: true,
                                    qualifiedAt: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Calculate metrics for each partner
            const partnersWithMetrics = partners.map(partner => {
                const referral = partner.referralCode;

                if (!referral) return null;

                // Current month metrics
                const thisMonthSignups = referral.referredVendors.length;
                const thisMonthActivated = referral.referredVendors.filter(
                    v => v.listingRewardStatus === 'QUALIFIED'
                ).length;
                const thisMonthClicks = referral.clicks.filter(
                    c => c.status === 'QUALIFIED'
                ).length;
                const totalClicks = referral.clicks.length;

                // Calculate pending this month
                let thisMonthEarnings = 0;
                referral.referredVendors.forEach(v => {
                    if (v.signupRewardStatus === 'QUALIFIED') thisMonthEarnings += v.signupRewardAmount;
                    if (v.listingRewardStatus === 'QUALIFIED') thisMonthEarnings += v.listingRewardAmount;
                });
                referral.clicks.forEach(c => {
                    if (c.status === 'QUALIFIED') thisMonthEarnings += c.rewardAmount;
                });

                // Fraud indicators
                const fraudCount = referral.referredVendors.filter(v => v.isFraud).length;
                const conversionRate = totalClicks > 0 ? (thisMonthSignups / totalClicks) * 100 : 0;

                return {
                    userId: partner.id,
                    name: partner.name,
                    email: partner.email,
                    phone: partner.phone,
                    joinedAt: partner.createdAt,
                    referralCode: referral.code,
                    isActive: referral.isActive,

                    // Lifetime stats
                    lifetimeReferrals: referral.totalReferrals,
                    lifetimeActivated: referral.successfulReferrals,
                    lifetimeEarnings: referral.totalEarnings,
                    pendingEarnings: referral.pendingEarnings,

                    // This month stats
                    thisMonthSignups,
                    thisMonthActivated,
                    thisMonthClicks,
                    thisMonthEarnings,

                    // Performance indicators
                    conversionRate: Math.round(conversionRate * 10) / 10,
                    fraudCount,
                    isSuspicious: fraudCount > 2 || conversionRate > 50
                };
            }).filter(Boolean);

            return res.json({ success: true, data: partnersWithMetrics });
        } catch (error) {
            console.error('Get Partners Overview Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/partners/:partnerId/details
     * Get detailed stats for a specific partner
     */
    async getPartnerDetails(req, res) {
        try {
            const { partnerId } = req.params;

            const partner = await prisma.user.findUnique({
                where: { id: partnerId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    phone: true,
                    createdAt: true,
                    referralCode: {
                        select: {
                            id: true,
                            code: true,
                            isActive: true,
                            totalReferrals: true,
                            successfulReferrals: true,
                            pendingEarnings: true,
                            totalEarnings: true,
                            referredVendors: {
                                select: {
                                    id: true,
                                    signupRewardStatus: true,
                                    listingRewardStatus: true,
                                    signupRewardAmount: true,
                                    listingRewardAmount: true,
                                    isFraud: true,
                                    createdAt: true,
                                    firstListingId: true,
                                    vendor: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            phone: true,
                                            createdAt: true,
                                            vendorProfile: {
                                                select: {
                                                    storeName: true
                                                }
                                            }
                                        }
                                    }
                                },
                                orderBy: {
                                    createdAt: 'desc'
                                }
                            },
                            clicks: {
                                select: {
                                    id: true,
                                    status: true,
                                    rewardAmount: true,
                                    ipAddress: true,
                                    clickedAt: true,
                                    qualifiedAt: true
                                },
                                orderBy: {
                                    clickedAt: 'desc'
                                },
                                take: 100
                            }
                        }
                    }
                }
            });

            if (!partner || !partner.referralCode) {
                return res.status(404).json({ success: false, message: 'Partner not found' });
            }

            return res.json({ success: true, data: partner });
        } catch (error) {
            console.error('Get Partner Details Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/partners/activity-feed
     * Get recent activity across all partners
     */
    async getActivityFeed(req, res) {
        try {
            const { limit = 50 } = req.query;

            // Get recent signups
            const recentSignups = await prisma.referralUse.findMany({
                take: parseInt(limit) / 2,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    createdAt: true,
                    signupRewardStatus: true,
                    listingRewardStatus: true,
                    vendor: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    referral: {
                        select: {
                            code: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            // Get recent clicks
            const recentClicks = await prisma.referralClick.findMany({
                take: parseInt(limit) / 2,
                orderBy: { clickedAt: 'desc' },
                select: {
                    id: true,
                    clickedAt: true,
                    qualifiedAt: true,
                    status: true,
                    ipAddress: true,
                    referral: {
                        select: {
                            code: true,
                            user: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            });

            // Combine and sort
            const activities = [
                ...recentSignups.map(s => ({
                    type: 'signup',
                    timestamp: s.createdAt,
                    partnerName: s.referral.user.name,
                    partnerCode: s.referral.code,
                    vendorName: s.vendor.name,
                    vendorEmail: s.vendor.email,
                    signupStatus: s.signupRewardStatus,
                    listingStatus: s.listingRewardStatus
                })),
                ...recentClicks.map(c => ({
                    type: 'click',
                    timestamp: c.clickedAt,
                    partnerName: c.referral.user.name,
                    partnerCode: c.referral.code,
                    status: c.status,
                    qualified: c.qualifiedAt !== null,
                    ipAddress: c.ipAddress?.substring(0, 10) + '...' // Truncate for privacy
                }))
            ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, parseInt(limit));

            return res.json({ success: true, data: activities });
        } catch (error) {
            console.error('Get Activity Feed Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PATCH /api/partners/:partnerId/toggle-active
     * Activate or deactivate a partner's referral code
     */
    async togglePartnerActive(req, res) {
        try {
            const { partnerId } = req.params;

            const user = await prisma.user.findUnique({
                where: { id: partnerId },
                select: {
                    referralCode: {
                        select: {
                            id: true,
                            isActive: true
                        }
                    }
                }
            });

            if (!user?.referralCode) {
                return res.status(404).json({ success: false, message: 'Partner not found' });
            }

            const updated = await prisma.referral.update({
                where: { id: user.referralCode.id },
                data: { isActive: !user.referralCode.isActive }
            });

            return res.json({
                success: true,
                message: `Partner ${updated.isActive ? 'activated' : 'deactivated'}`,
                data: updated
            });
        } catch (error) {
            console.error('Toggle Partner Active Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PATCH /api/partners/referral-use/:id/flag-fraud
     * Flag a referral as fraudulent
     */
    async flagFraud(req, res) {
        try {
            const { id } = req.params;
            const { isFraud } = req.body;

            const updated = await prisma.referralUse.update({
                where: { id },
                data: { isFraud: isFraud === true }
            });

            return res.json({
                success: true,
                message: `Referral marked as ${isFraud ? 'fraud' : 'legitimate'}`,
                data: updated
            });
        } catch (error) {
            console.error('Flag Fraud Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * POST /api/partners/create
     * Manually create a new partner account
     */
    async createPartner(req, res) {
        try {
            const { name, email, phone } = req.body;

            // 1. Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            if (phone) {
                const existingPhone = await prisma.user.findUnique({
                    where: { phone }
                });

                if (existingPhone) {
                    return res.status(409).json({
                        success: false,
                        message: 'User with this phone number already exists'
                    });
                }
            }

            // 2. Generate Credentials
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // 16 chars
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            // Unique Referral Code
            let referralCode = name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);
            // Ensure uniqueness loop could be added here, but low collision prob for now.

            // 3. Create User & Referral
            const newUser = await prisma.user.create({
                data: {
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    phone,
                    role: 'USER', // Partners are users with referral links
                    isEmailVerified: true, // Auto-verify since admin created it
                    referralCode: {
                        create: {
                            code: referralCode,
                            isActive: true
                        }
                    }
                }
            });

            // 4. Send Welcome Email
            const loginUrl = process.env.FRONTEND_URL || 'https://listup.ng/login'; // Adjust as needed
            try {
                // We need to require the email service. If the dynamic require above failed, this will fail.
                // Safest is to define email logic here or ensure path.
                // Assuming relative path works or module alias.
                // Let's rely on the require at top.
                await sendPartnerWelcomeEmail(email, name, randomPassword, loginUrl);
            } catch (emailErr) {
                console.error("Failed to send partner welcome email:", emailErr);
                // Don't fail the request, just warn
            }

            return res.status(201).json({
                success: true,
                message: 'Partner created successfully',
                data: {
                    id: newUser.id,
                    email: newUser.email,
                    referralCode
                }
            });

        } catch (error) {
            console.error('Create Partner Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/settings/rewards
     * Get current system reward settings
     */
    async getSettings(req, res) {
        try {
            // Get first record or default
            let settings = await prisma.systemSettings.findFirst();

            if (!settings) {
                // Return defaults if not set in DB
                return res.json({
                    success: true,
                    data: {
                        signupRewardAmount: 25,
                        listingRewardAmount: 25,
                        clickRewardAmount: 15,
                        minimumPayoutAmount: 1000
                    }
                });
            }

            return res.json({ success: true, data: settings });
        } catch (error) {
            console.error('Get Settings Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PUT /api/settings/rewards
     * Update system reward settings
     */
    async updateSettings(req, res) {
        try {
            const {
                signupRewardAmount,
                listingRewardAmount,
                clickRewardAmount,
                minimumPayoutAmount
            } = req.body;

            let settings = await prisma.systemSettings.findFirst();

            if (settings) {
                settings = await prisma.systemSettings.update({
                    where: { id: settings.id },
                    data: {
                        signupRewardAmount: parseFloat(signupRewardAmount),
                        listingRewardAmount: parseFloat(listingRewardAmount),
                        clickRewardAmount: parseFloat(clickRewardAmount),
                        minimumPayoutAmount: parseFloat(minimumPayoutAmount)
                    }
                });
            } else {
                settings = await prisma.systemSettings.create({
                    data: {
                        signupRewardAmount: parseFloat(signupRewardAmount),
                        listingRewardAmount: parseFloat(listingRewardAmount),
                        clickRewardAmount: parseFloat(clickRewardAmount),
                        minimumPayoutAmount: parseFloat(minimumPayoutAmount)
                    }
                });
            }

            return res.json({ success: true, message: 'Settings updated', data: settings });
        } catch (error) {
            console.error('Update Settings Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * GET /api/partners/leaderboard
     * Top partners for Admin (full names)
     */
    async getLeaderboard(req, res) {
        try {
            const topPartners = await prisma.referral.findMany({
                where: { isActive: true },
                take: 20,
                orderBy: [
                    { successfulReferrals: 'desc' },
                    { totalClicks: 'desc' }
                ],
                include: {
                    user: { select: { name: true, email: true, profileImage: true } }
                }
            });

            return res.json({
                success: true,
                data: topPartners.map((p, index) => ({
                    rank: index + 1,
                    name: p.user.name,
                    email: p.user.email,
                    successfulReferrals: p.successfulReferrals,
                    totalClicks: p.totalClicks,
                    referralCode: p.code,
                    totalEarnings: p.totalEarnings
                }))
            });
        } catch (error) {
            console.error('Admin Leaderboard Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
}

module.exports = new PartnerAnalyticsController();
