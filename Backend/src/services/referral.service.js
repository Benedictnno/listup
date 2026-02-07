const prisma = require('../lib/prisma');
const crypto = require('crypto');

class ReferralService {

    /**
     * Tracks a raw click.
     * Returns the click ID if successful, or null if duplicate/ignored.
     */
    async trackClick(referralCode, ipAddress, userAgent) {
        console.log(`🔍 Tracking click for code: ${referralCode}, IP: ${ipAddress}`);

        // 1. Find referral
        const referral = await prisma.referral.findUnique({
            where: { code: referralCode }
        });

        if (!referral) {
            console.warn(`⚠️ Referral code not found: ${referralCode}`);
            return null;
        }
        if (!referral.isActive) {
            console.warn(`⚠️ Referral inactive: ${referralCode}`);
            return null;
        }

        // 2. Generate fingerprint (IP + UA + Date)
        const today = new Date().toISOString().split('T')[0];
        const fingerprint = crypto
            .createHash('sha256')
            .update(`${ipAddress}-${userAgent}-${today}`)
            .digest('hex');

        // 3. Check for recent click from this fingerprint (prevent spam)
        const existingClick = await prisma.referralClick.findFirst({
            where: {
                referralId: referral.id,
                fingerprint: fingerprint,
                clickedAt: {
                    gt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });

        if (existingClick) {
            console.log(`ℹ️ Duplicate click detected (fingerprint match). ID: ${existingClick.id}`);
            return existingClick.id;
        }

        // 4. Get Reward Settings
        const settings = await prisma.systemSettings.findFirst();
        const rewardAmount = settings ? settings.clickRewardAmount : 15.00;

        // 5. Create Click Record
        const click = await prisma.$transaction(async (tx) => {
            const newClick = await tx.referralClick.create({
                data: {
                    referralId: referral.id,
                    fingerprint,
                    ipAddress,
                    userAgent,
                    status: 'STARTED',
                    rewardAmount: rewardAmount
                }
            });

            await tx.referral.update({
                where: { id: referral.id },
                data: {
                    totalClicks: { increment: 1 }
                }
            });

            return newClick;
        });
        console.log(`✅ Click recorded successfully! ID: ${click.id}`);

        return click.id;
    }

    /**
     * Qualifies a click (called after 10s engagement).
     */
    async qualifyClick(clickId) {
        const click = await prisma.referralClick.findUnique({
            where: { id: clickId },
            include: { referral: true }
        });

        if (!click) return { success: false, reason: 'Not found' };
        if (click.status !== 'STARTED') return { success: false, reason: 'Already processed' };

        // Update Click Status
        await prisma.$transaction([
            prisma.referralClick.update({
                where: { id: clickId },
                data: {
                    status: 'QUALIFIED',
                    qualifiedAt: new Date()
                }
            }),
            // Credit to Pending Earnings
            prisma.referral.update({
                where: { id: click.referralId },
                data: {
                    pendingEarnings: { increment: click.rewardAmount },
                    // Optional: We could track total clicks here too if needed for fast stats
                }
            })
        ]);

        return { success: true };
    }

    /**
     * Records a Signup Event (Referred Vendor).
     */
    async extractReferralCode(code) {
        const referral = await prisma.referral.findUnique({
            where: { code }
        });
        return referral;
    }

    async createReferralUse(userId, referralCode) {
        // 1. Validate Code
        const referral = await prisma.referral.findUnique({
            where: { code: referralCode }
        });

        if (!referral) return null;

        // 2. Create ReferralUse Record (Signup Reward: QUALIFIED immediately)
        // Note: We set status to QUALIFIED. It sits in "Pending Earnings" effectively (via Month-End calculation or direct increment?)
        // The requirement says "Earnings accumulate as Pending". 
        // Let's increment PendingEarnings on the Referral itself for visibility.

        // 3. Get Reward Settings
        const settings = await prisma.systemSettings.findFirst();
        const signupReward = settings ? settings.signupRewardAmount : 25.00;

        try {
            return await prisma.$transaction(async (tx) => {
                const refUse = await tx.referralUse.create({
                    data: {
                        referralId: referral.id,
                        vendorId: userId,
                        signupRewardStatus: 'QUALIFIED',
                        signupRewardAmount: signupReward,
                        listingRewardStatus: 'PENDING'
                    }
                });

                // Update Stats
                await tx.referral.update({
                    where: { id: referral.id },
                    data: {
                        totalReferrals: { increment: 1 },
                        pendingEarnings: { increment: signupReward }
                    }
                });

                return refUse;
            });
        } catch (error) {
            console.error("Referral creation failed:", error);
            return null;
        }
    }

    /**
     * Records a First Listing Event.
     */
    async completeListingAction(userId, listingId) {
        // 1. Find the ReferralUse record for this user
        const refUse = await prisma.referralUse.findUnique({
            where: { vendorId: userId }
        });

        if (!refUse) return; // Not referred
        if (refUse.listingRewardStatus !== 'PENDING') return; // Already paid/qualified

        // 2. Get Reward Settings
        const settings = await prisma.systemSettings.findFirst();
        const listingReward = settings ? settings.listingRewardAmount : 25.00;

        // 3. Mark as Qualified
        await prisma.$transaction([
            prisma.referralUse.update({
                where: { id: refUse.id },
                data: {
                    listingRewardStatus: 'QUALIFIED',
                    firstListingId: listingId,
                    listingRewardAmount: listingReward
                }
            }),
            prisma.referral.update({
                where: { id: refUse.referralId },
                data: {
                    successfulReferrals: { increment: 1 }, // "Activated" vendor
                    pendingEarnings: { increment: listingReward }
                }
            })
        ]);
    }

    /**
     * Get Partner Dashboard Stats
     */
    async getPartnerStats(userId) {
        const referral = await prisma.referral.findUnique({
            where: { userId },
            include: {
                referredVendors: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { vendor: { select: { name: true, createdAt: true } } }
                },
                clicks: {
                    take: 20,
                    orderBy: { clickedAt: 'desc' },
                    select: {
                        status: true,
                        rewardAmount: true,
                        clickedAt: true,
                        qualifiedAt: true,
                        ipAddress: true
                    }
                }
            }
        });

        if (!referral) return null;

        // Calculate 'Activated' count for this month
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

        const currentMonthActivated = await prisma.referralUse.count({
            where: {
                referralId: referral.id,
                listingRewardStatus: { not: 'PENDING' },
                updatedAt: { gte: firstDay }
            }
        });

        const settings = await prisma.systemSettings.findFirst();

        // Merge and sort activities
        const activities = [
            ...referral.referredVendors.map(rv => ({
                type: 'signup',
                vendorName: this.maskName(rv.vendor.name),
                signupStatus: rv.signupRewardStatus,
                listingStatus: rv.listingRewardStatus,
                date: rv.createdAt
            })),
            ...referral.clicks.map(c => ({
                type: 'click',
                status: c.status,
                qualified: c.qualifiedAt !== null,
                date: c.clickedAt
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);

        return {
            referralCode: referral.code,
            rewardRates: {
                signup: settings ? settings.signupRewardAmount : 25,
                listing: settings ? settings.listingRewardAmount : 25,
                click: settings ? settings.clickRewardAmount : 15
            },
            pendingEarnings: referral.pendingEarnings || 0,
            totalPaid: referral.totalEarnings || 0,
            totalClicks: referral.totalClicks || 0,
            activatedThisMonth: currentMonthActivated,
            recentActivity: activities
        };
    }



    /**
     * Get Leaderboard (Top Partners by Activated Vendors)
     */
    async getLeaderboard() {
        const topPartners = await prisma.referral.findMany({
            where: { isActive: true },
            take: 10,
            orderBy: [
                { successfulReferrals: 'desc' },
                { totalClicks: 'desc' }
            ],
            include: {
                user: { select: { name: true, profileImage: true } }
            }
        });

        return topPartners.map((p, index) => ({
            rank: index + 1,
            name: this.maskName(p.user.name),
            successfulReferrals: p.successfulReferrals,
            totalClicks: p.totalClicks
        }));
    }

    maskName(name) {
        if (!name) return 'Unknown Partner';
        const parts = name.split(' ');
        if (parts.length > 1) return `${parts[0]} ${parts[1][0]}.`;
        return name;
    }
}

module.exports = new ReferralService();
