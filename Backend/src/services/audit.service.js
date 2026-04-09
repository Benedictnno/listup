const prisma = require("../lib/prisma");

/**
 * Audit Service for logging system activities and user actions.
 */
class AuditService {
  /**
   * Log an action to the database.
   */
  async log({ userId, action, targetType, targetId, metadata, req }) {
    try {
      const data = {
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
        ipAddress: req ? (req.headers["cf-connecting-ip"] || req.ip || "").replace(/^::ffff:/, "") : undefined,
        userAgent: req ? req.headers["user-agent"] : undefined,
      };

      if (userId) {
        data.userId = userId;
      }

      const log = await prisma.auditLog.create({
        data,
      });

      return log;
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // We don't throw here to prevent breaking the main request flow
      return null;
    }
  }

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

    if (userId) where.userId = userId;
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
