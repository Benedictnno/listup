const express = require('express');
const router = express.Router();
const whatsappAnalyticsController = require('../controllers/whatsapp-analytics.controller');
const { auth, allow } = require('../middleware/auth');

// All routes require authentication and admin role
const adminAuth = [auth, allow('ADMIN')];

/**
 * @route   GET /api/admin/whatsapp/stats
 * @desc    Get WhatsApp bot statistics
 * @access  Admin only
 */
router.get('/stats', adminAuth, whatsappAnalyticsController.getWhatsAppStats);

/**
 * @route   GET /api/admin/whatsapp/engagement
 * @desc    Get user engagement scores
 * @access  Admin only
 */
router.get('/engagement', adminAuth, whatsappAnalyticsController.getEngagementScores);

/**
 * @route   GET /api/admin/whatsapp/rate-limits
 * @desc    Get users hitting rate limits
 * @access  Admin only
 */
router.get('/rate-limits', adminAuth, whatsappAnalyticsController.getRateLimitedUsers);

/**
 * @route   GET /api/admin/whatsapp/activity
 * @desc    Get recent WhatsApp activity
 * @access  Admin only
 */
router.get('/activity', adminAuth, whatsappAnalyticsController.getRecentActivity);

module.exports = router;
