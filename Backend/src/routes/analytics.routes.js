const router = require('express').Router();
const prisma = require('../lib/prisma');
const { auth, allow } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiter');

// Track a listing view (unique-ish per user/session).
router.post('/listings/:listingId/view', generalLimiter, async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const sessionId = req.body?.sessionId || null;
    const userId = req.user ? req.user.id : null;

    // Basic validation
    if (!listingId) {
      return res.status(400).json({ message: 'Missing listingId' });
    }

    await prisma.listingView.create({
      data: {
        listingId,
        userId,
        sessionId,
      },
    });

    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Track a save event (requires auth)
router.post('/listings/:listingId/save', generalLimiter, auth, async (req, res, next) => {
  try {
    const { listingId } = req.params;

    if (!listingId) {
      return res.status(400).json({ message: 'Missing listingId' });
    }

    await prisma.listingSaveEvent.create({
      data: {
        listingId,
        userId: req.user.id,
      },
    });

    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Track WhatsApp/message click
router.post('/listings/:listingId/message-click', generalLimiter, async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user ? req.user.id : null;

    if (!listingId) {
      return res.status(400).json({ message: 'Missing listingId' });
    }

    await prisma.listingMessageClick.create({
      data: {
        listingId,
        userId,
      },
    });

    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

// Aggregated metrics for a vendor's listings
router.get('/vendors/:vendorId/listings-metrics', generalLimiter, auth, allow('VENDOR'), async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { range = '30d' } = req.query;

    // Ensure vendor can only access their own metrics
    if (vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: cannot access metrics for another vendor' });
    }

    const now = new Date();
    let from = null;

    if (range === '7d') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else {
      // 'all' or unknown -> no lower bound
      from = null;
    }

    const timeFilter = from
      ? { gte: from, lte: now }
      : { lte: now };

    // Get all listings for this vendor
    const listings = await prisma.listing.findMany({
      where: { sellerId: vendorId },
      select: { id: true },
    });

    const listingIds = listings.map((l) => l.id);

    if (listingIds.length === 0) {
      return res.json({
        range,
        from: from ? from.toISOString() : null,
        to: now.toISOString(),
        totals: { views: 0, saves: 0, messages: 0 },
        perListing: [],
      });
    }

    const perListing = [];
    let totalViews = 0;
    let totalSaves = 0;
    let totalMessages = 0;

    for (const listingId of listingIds) {
      const [views, saves, messages] = await Promise.all([
        prisma.listingView.count({
          where: {
            listingId,
            viewedAt: timeFilter,
          },
        }),
        prisma.listingSaveEvent.count({
          where: {
            listingId,
            savedAt: timeFilter,
          },
        }),
        prisma.listingMessageClick.count({
          where: {
            listingId,
            clickedAt: timeFilter,
          },
        }),
      ]);

      totalViews += views;
      totalSaves += saves;
      totalMessages += messages;

      perListing.push({ listingId, views, saves, messages });
    }

    res.json({
      range,
      from: from ? from.toISOString() : null,
      to: now.toISOString(),
      totals: {
        views: totalViews,
        saves: totalSaves,
        messages: totalMessages,
      },
      perListing,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
