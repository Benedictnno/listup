const prisma = require('../lib/prisma');

exports.getTrending = async (req, res, next) => {
  try {
    const { categoryId, limit = 12 } = req.query;
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h window

    // Score = (3 × messageClicks) + (2 × saves) + (1 × views)
    // Weighted because message click = highest purchase intent
    
    const [views, saves, clicks] = await Promise.all([
      prisma.listingView.groupBy({
        by: ['listingId'],
        where: { viewedAt: { gte: since } },
        _count: { _all: true }
      }),
      prisma.listingSaveEvent.groupBy({
        by: ['listingId'],
        where: { savedAt: { gte: since } },
        _count: { _all: true }
      }),
      prisma.listingMessageClick.groupBy({
        by: ['listingId'],
        where: { clickedAt: { gte: since } },
        _count: { _all: true }
      }),
    ]);

    // Build score map
    const scores = new Map();
    
    views.forEach(v => {
      scores.set(v.listingId, (scores.get(v.listingId) || 0) + v._count._all);
    });
    saves.forEach(s => {
      scores.set(s.listingId, (scores.get(s.listingId) || 0) + s._count._all * 2);
    });
    clicks.forEach(c => {
      scores.set(c.listingId, (scores.get(c.listingId) || 0) + c._count._all * 3);
    });

    // Sort by score descending
    const topIds = [...scores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([id]) => id);

    if (topIds.length === 0) {
      // Cold start: fall back to newest boosted listings
      const fallbackWhere = { isActive: true };
      if (categoryId) fallbackWhere.categoryId = categoryId;
      
      const fallback = await prisma.listing.findMany({
        where: fallbackWhere,
        orderBy: [{ boostScore: 'desc' }, { createdAt: 'desc' }],
        take: parseInt(limit),
        select: { id: true, title: true, price: true, images: true,
                   location: true, condition: true, category: { select: { id: true, name: true } },
                   seller: { select: { id: true, name: true, vendorProfile: { select: { storeName: true, logo: true } } } } }
      });
      return res.json(fallback);
    }

    const listingsWhere = {
        id: { in: topIds },
        isActive: true,
    };
    if (categoryId) listingsWhere.categoryId = categoryId;

    // Fetch full listing data preserving score order
    const listings = await prisma.listing.findMany({
      where: listingsWhere,
      select: {
        id: true, title: true, price: true, images: true,
        location: true, condition: true,
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, vendorProfile: { select: { storeName: true, logo: true } } } }
      }
    });

    // Restore score ordering
    const ordered = topIds
      .map(id => listings.find(l => l.id === id))
      .filter(Boolean);

    res.json(ordered);
  } catch (e) {
    next(e);
  }
};

exports.getForYou = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Auth required' });
    
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 12;

    // 1. Get this user's signals
    const [userSaves, userViews, userClicks] = await Promise.all([
      prisma.listingSaveEvent.findMany({
        where: { userId },
        select: { listingId: true },
        orderBy: { savedAt: 'desc' },
        take: 20
      }),
      prisma.listingView.findMany({
        where: { userId },
        select: { listingId: true },
        orderBy: { viewedAt: 'desc' },
        take: 30
      }),
      prisma.listingMessageClick.findMany({
        where: { userId },
        select: { listingId: true },
        orderBy: { clickedAt: 'desc' },
        take: 10
      }),
    ]);

    const interactedIds = new Set([
      ...userSaves.map(s => s.listingId),
      ...userViews.map(v => v.listingId),
      ...userClicks.map(c => c.listingId),
    ]);

    if (interactedIds.size === 0) {
      // No history: send trending
      return exports.getTrending(req, res, next);
    }

    // 2. Get categories of interacted listings
    const interactedListings = await prisma.listing.findMany({
      where: { id: { in: [...interactedIds] } },
      select: { categoryId: true, price: true }
    });

    // Category affinity: count how many times user interacted per category
    const categoryCount = new Map();
    interactedListings.forEach(l => {
        if (l.categoryId) {
            categoryCount.set(l.categoryId, (categoryCount.get(l.categoryId) || 0) + 1);
        }
    });

    const preferredCategories = [...categoryCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    // 3. Price range affinity
    const prices = interactedListings.map(l => Number(l.price)).filter(p => !isNaN(p));
    let priceMin = undefined;
    let priceMax = undefined;
    
    if (prices.length > 0) {
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        priceMin = avgPrice * 0.5;
        priceMax = avgPrice * 2.0;
    }

    // 4. Find recommendations: listings in preferred categories,
    //    in price range, not already seen
    const recommendationsWhere = {
        isActive: true,
        id: { notIn: [...interactedIds] }
    };
    if (preferredCategories.length > 0) {
        recommendationsWhere.categoryId = { in: preferredCategories };
    }
    if (priceMin !== undefined && priceMax !== undefined) {
        recommendationsWhere.price = { gte: priceMin, lte: priceMax };
    }

    const recommendations = await prisma.listing.findMany({
      where: recommendationsWhere,
      orderBy: [
        { boostScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true, title: true, price: true, images: true,
        location: true, condition: true,
        category: { select: { id: true, name: true, slug: true } },
        seller: { select: { id: true, name: true, vendorProfile: { select: { storeName: true, logo: true } } } }
      }
    });

    // Pad with trending if not enough results
    if (recommendations.length < limit) {
      const needed = limit - recommendations.length;
      const existingIds = new Set([...interactedIds, ...recommendations.map(r => r.id)]);
      
      const padding = await prisma.listing.findMany({
        where: { isActive: true, id: { notIn: [...existingIds] } },
        orderBy: [{ boostScore: 'desc' }, { createdAt: 'desc' }],
        take: needed,
        select: {
          id: true, title: true, price: true, images: true,
          location: true, condition: true,
          category: { select: { id: true, name: true, slug: true } },
          seller: { select: { id: true, name: true, vendorProfile: { select: { storeName: true, logo: true } } } }
        }
      });
      
      recommendations.push(...padding);
    }

    res.json(recommendations);
  } catch (e) {
    next(e);
  }
};
