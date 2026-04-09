const router = require("express").Router();
const auditService = require("../services/audit.service");
const { protect, admin } = require("../middleware/auth");

/**
 * @route   GET /api/audit/logs
 * @desc    Get all audit logs (Admin only)
 * @access  Private/Admin
 */
router.get("/logs", protect, admin, async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      targetType, 
      targetId, 
      startDate, 
      endDate, 
      page, 
      limit 
    } = req.query;

    const result = await auditService.getLogs({
      userId,
      action,
      targetType,
      targetId,
      startDate,
      endDate,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });

    res.json({
      success: true,
      data: result.logs,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Fetch audit logs error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching audit logs",
    });
  }
});

/**
 * @route   GET /api/audit/actions
 * @desc    Get unique audit actions for filtering
 * @access  Private/Admin
 */
router.get("/actions", protect, admin, async (req, res) => {
  try {
    const prisma = require("../lib/prisma");
    const actions = await prisma.auditLog.groupBy({
      by: ["action"],
    });

    res.json({
      success: true,
      data: actions.map(a => a.action),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
