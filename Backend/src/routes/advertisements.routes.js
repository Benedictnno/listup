// Advertisement Routes for Public API

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * GET /api/advertisements/random
 * Get a random active advertisement
 * Public endpoint - no authentication required
 */
router.get('/random', async (req, res) => {
  try {
    const now = new Date();

    // Get all active, non-expired advertisements
    const activeAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        expiryDate: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        targetUrl: true
      }
    });

    // If no active ads, return null
    if (activeAds.length === 0) {
      return res.json({
        success: true,
        data: { advertisement: null }
      });
    }

    // Select random advertisement
    const randomIndex = Math.floor(Math.random() * activeAds.length);
    const advertisement = activeAds[randomIndex];

    res.json({
      success: true,
      data: { advertisement }
    });
  } catch (error) {
    console.error('Get random advertisement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch advertisement'
    });
  }
});

/**
 * GET /api/advertisements/carousel
 * Get all active HERO_CAROUSEL advertisements
 * Public endpoint - no authentication required
 */
router.get('/carousel', async (req, res) => {
  try {
    const now = new Date();

    const activeCarouselAds = await prisma.advertisement.findMany({
      where: {
        isActive: true,
        position: 'HERO_CAROUSEL',
        expiryDate: {
          gte: now
        }
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        targetUrl: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: { advertisements: activeCarouselAds }
    });
  } catch (error) {
    console.error('Get carousel advertisements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch carousel advertisements'
    });
  }
});

/**
 * POST /api/advertisements/:id/impression
 * Track when an advertisement is displayed
 * Public endpoint - no authentication required
 */
router.post('/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.advertisement.update({
      where: { id },
      data: {
        impressions: {
          increment: 1
        }
      }
    });

    res.json({
      success: true,
      message: 'Impression tracked'
    });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track impression'
    });
  }
});

/**
 * POST /api/advertisements/:id/click
 * Track when an advertisement is clicked
 * Public endpoint - no authentication required
 */
router.post('/:id/click', async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await prisma.advertisement.update({
      where: { id },
      data: {
        clicks: {
          increment: 1
        }
      }
    });

    // Return the target URL for redirection
    res.json({
      success: true,
      data: {
        targetUrl: advertisement.targetUrl
      }
    });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track click'
    });
  }
});

module.exports = router;
