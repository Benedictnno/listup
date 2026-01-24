const prisma = require('../lib/prisma');

class AdminPayoutsController {

    /**
     * GET /admin/payouts/periods
     * Lists all payout periods
     */
    async getPayoutPeriods(req, res) {
        try {
            const periods = await prisma.payoutPeriod.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    statements: {
                        select: {
                            id: true,
                            userId: true,
                            status: true,
                            totalEarned: true
                        }
                    }
                }
            });

            return res.json({ success: true, data: periods });
        } catch (error) {
            console.error('Get Payout Periods Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * POST /admin/payouts/lock-month
     * Locks the previous month and generates statements
     */
    async lockMonth(req, res) {
        try {
            const { year, month } = req.body; // e.g., { year: 2026, month: 1 }

            // Default to previous month if not specified
            const now = new Date();
            const targetYear = year || now.getFullYear();
            const targetMonth = month || (now.getMonth() === 0 ? 12 : now.getMonth()); // 1-12

            // Check if period already exists
            const existing = await prisma.payoutPeriod.findUnique({
                where: {
                    month_year: { month: targetMonth, year: targetYear }
                }
            });

            if (existing && existing.status !== 'OPEN') {
                return res.status(400).json({
                    success: false,
                    message: 'Period already locked or completed'
                });
            }

            // Calculate period boundaries
            const startDate = new Date(targetYear, targetMonth - 1, 1);
            const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

            let period;
            if (existing) {
                // Update existing OPEN period
                period = await prisma.payoutPeriod.update({
                    where: { id: existing.id },
                    data: { status: 'LOCKED' }
                });
            } else {
                // Create new period
                period = await prisma.payoutPeriod.create({
                    data: {
                        month: targetMonth,
                        year: targetYear,
                        startDate,
                        endDate,
                        status: 'LOCKED'
                    }
                });
            }

            // Generate statements for all partners with activity in this period
            await this.generateStatements(period);

            return res.json({
                success: true,
                message: 'Period locked and statements generated',
                data: period
            });

        } catch (error) {
            console.error('Lock Month Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * Helper: Generate monthly statements
     */
    async generateStatements(period) {
        // Find all referrals with activity in this period
        const referrals = await prisma.referral.findMany({
            where: {
                OR: [
                    {
                        referredVendors: {
                            some: {
                                OR: [
                                    {
                                        signupRewardStatus: 'QUALIFIED',
                                        updatedAt: {
                                            gte: period.startDate,
                                            lte: period.endDate
                                        }
                                    },
                                    {
                                        listingRewardStatus: 'QUALIFIED',
                                        updatedAt: {
                                            gte: period.startDate,
                                            lte: period.endDate
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        clicks: {
                            some: {
                                status: 'QUALIFIED',
                                qualifiedAt: {
                                    gte: period.startDate,
                                    lte: period.endDate
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                referredVendors: true,
                clicks: true
            }
        });

        for (const referral of referrals) {
            // Calculate earnings for this period
            let totalEarned = 0;
            let vendorsReferredCount = 0;
            let vendorsActivatedCount = 0;
            let clicksCount = 0;

            // Process ReferralUse records
            for (const refUse of referral.referredVendors) {
                const isInPeriod = refUse.updatedAt >= period.startDate && refUse.updatedAt <= period.endDate;

                if (isInPeriod) {
                    vendorsReferredCount++;

                    if (refUse.signupRewardStatus === 'QUALIFIED') {
                        totalEarned += refUse.signupRewardAmount;
                    }

                    if (refUse.listingRewardStatus === 'QUALIFIED') {
                        totalEarned += refUse.listingRewardAmount;
                        vendorsActivatedCount++;
                    }
                }
            }

            // Process Clicks
            for (const click of referral.clicks) {
                const isInPeriod = click.qualifiedAt && click.qualifiedAt >= period.startDate && click.qualifiedAt <= period.endDate;

                if (isInPeriod && click.status === 'QUALIFIED') {
                    totalEarned += click.rewardAmount;
                    clicksCount++;
                }
            }

            // Create or update statement
            if (totalEarned > 0) {
                await prisma.monthlyStatement.upsert({
                    where: {
                        payoutPeriodId_userId: {
                            payoutPeriodId: period.id,
                            userId: referral.userId
                        }
                    },
                    create: {
                        payoutPeriodId: period.id,
                        userId: referral.userId,
                        vendorsReferredCount,
                        vendorsActivatedCount,
                        clicksCount,
                        totalEarned,
                        status: 'DRAFT'
                    },
                    update: {
                        vendorsReferredCount,
                        vendorsActivatedCount,
                        clicksCount,
                        totalEarned
                    }
                });
            }
        }
    }

    /**
     * GET /admin/payouts/statements/:periodId
     * Get all statements for a specific period
     */
    async getStatements(req, res) {
        try {
            const { periodId } = req.params;

            const statements = await prisma.monthlyStatement.findMany({
                where: { payoutPeriodId: periodId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: { totalEarned: 'desc' }
            });

            return res.json({ success: true, data: statements });
        } catch (error) {
            console.error('Get Statements Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PATCH /admin/payouts/statements/:id/approve
     * Approve a statement
     */
    async approveStatement(req, res) {
        try {
            const { id } = req.params;

            const statement = await prisma.monthlyStatement.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            return res.json({ success: true, data: statement });
        } catch (error) {
            console.error('Approve Statement Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }

    /**
     * PATCH /admin/payouts/statements/:id/mark-paid
     * Mark statement as paid
     */
    async markPaid(req, res) {
        try {
            const { id } = req.params;
            const { paymentReference } = req.body;

            const statement = await prisma.monthlyStatement.update({
                where: { id },
                data: {
                    status: 'PAID',
                    paidAt: new Date(),
                    paymentReference
                }
            });

            return res.json({ success: true, data: statement });
        } catch (error) {
            console.error('Mark Paid Error:', error);
            return res.status(500).json({ success: false, message: 'Internal error' });
        }
    }
}

module.exports = new AdminPayoutsController();
