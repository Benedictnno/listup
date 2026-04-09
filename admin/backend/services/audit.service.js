const prisma = require("../lib/prisma");

/**
 * Audit Service for fetching audit logs for the admin dashboard.
 */
class AuditService {
  /**
   * Fetch audit logs with filtering and pagination.
   */
  async getLogs({ 
    userId, 
    action, 
    targetType, 
    targetId, 
    startDate, 
    endDate, 
    page = 1, 
    limit = 20 
  }) {
    const skip = (page - 1) * limit;
    const where = {};

    if (userId) {
      // Allow searching by user ID or email if we can resolve it
      // For now, assume it's a direct ID or email match
      where.OR = [
        { userId: userId.match(/^[0-9a-fA-F]{24}$/) ? userId : undefined },
        { user: { email: { contains: userId, mode: "insensitive" } } },
        { user: { name: { contains: userId, mode: "insensitive" } } }
      ].filter(cond => cond.userId !== undefined || cond.user !== undefined);
    }
    
    if (action) where.action = action;
    if (targetType) where.targetType = targetType;
    if (targetId) where.targetId = targetId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new AuditService();
