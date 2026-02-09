const prisma = require('../lib/prisma');

/**
 * Get WhatsApp bot statistics
 * GET /api/admin/whatsapp/stats
 */
exports.getWhatsAppStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        // Today's stats
        const todayStats = {
            messagesSent: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: today }, direction: 'outbound' }
            }),
            messagesReceived: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: today }, direction: 'inbound' }
            }),
            throttledMessages: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: today }, wasThrottled: true }
            })
        };

        // Last 7 days stats
        const last7DaysStats = {
            messagesSent: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: last7Days }, direction: 'outbound' }
            }),
            messagesReceived: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: last7Days }, direction: 'inbound' }
            }),
            throttledMessages: await prisma.whatsAppMessageLog.count({
                where: { createdAt: { gte: last7Days }, wasThrottled: true }
            })
        };

        // User engagement stats
        const userStats = {
            totalUsers: await prisma.user.count({
                where: { phone: { not: null } }
            }),
            optedOutUsers: await prisma.user.count({
                where: { whatsappStopRequested: true }
            }),
            activeUsers: await prisma.user.count({
                where: {
                    lastWhatsappInteraction: { gte: last7Days }
                }
            }),
            lowEngagementUsers: await prisma.user.count({
                where: {
                    whatsappEngagementScore: { lt: 30 },
                    phone: { not: null }
                }
            })
        };

        // Average response delay
        const avgDelayResult = await prisma.whatsAppMessageLog.aggregate({
            where: {
                createdAt: { gte: last7Days },
                responseDelay: { not: null }
            },
            _avg: {
                responseDelay: true
            }
        });

        res.json({
            success: true,
            data: {
                today: todayStats,
                last7Days: last7DaysStats,
                users: userStats,
                averageResponseDelay: avgDelayResult._avg.responseDelay
                    ? Math.round(avgDelayResult._avg.responseDelay / 1000) + 's'
                    : 'N/A'
            }
        });

    } catch (error) {
        console.error('Error fetching WhatsApp stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch WhatsApp statistics'
        });
    }
};

/**
 * Get user engagement scores
 * GET /api/admin/whatsapp/engagement
 */
exports.getEngagementScores = async (req, res) => {
    try {
        const { limit = 50, minScore, maxScore } = req.query;

        const where = {
            phone: { not: null }
        };

        if (minScore !== undefined) {
            where.whatsappEngagementScore = { gte: parseFloat(minScore) };
        }
        if (maxScore !== undefined) {
            where.whatsappEngagementScore = {
                ...where.whatsappEngagementScore,
                lte: parseFloat(maxScore)
            };
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsappEngagementScore: true,
                whatsappMessageCount: true,
                lastWhatsappInteraction: true,
                whatsappStopRequested: true
            },
            orderBy: {
                whatsappEngagementScore: 'asc'
            },
            take: parseInt(limit)
        });

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error fetching engagement scores:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch engagement scores'
        });
    }
};

/**
 * Get users hitting rate limits
 * GET /api/admin/whatsapp/rate-limits
 */
exports.getRateLimitedUsers = async (req, res) => {
    try {
        const today = new Date().toDateString();

        const users = await prisma.user.findMany({
            where: {
                whatsappMessageCount: { gte: 15 }, // Close to or at limit
                whatsappLastMessageDate: {
                    gte: new Date(today)
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                whatsappMessageCount: true,
                whatsappLastMessageDate: true
            },
            orderBy: {
                whatsappMessageCount: 'desc'
            }
        });

        res.json({
            success: true,
            data: users,
            totalCount: users.length
        });

    } catch (error) {
        console.error('Error fetching rate-limited users:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rate-limited users'
        });
    }
};

/**
 * Get recent WhatsApp activity
 * GET /api/admin/whatsapp/activity
 */
exports.getRecentActivity = async (req, res) => {
    try {
        const { limit = 50 } = req.query;

        const messages = await prisma.whatsAppMessageLog.findMany({
            take: parseInt(limit),
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Error fetching recent activity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch recent activity'
        });
    }
};


