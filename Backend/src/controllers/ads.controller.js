const prisma = require("../lib/prisma");

// Create Ad
exports.createAd = async (req, res, next) => {
  try {
    if (req.user.role !== "VENDOR") {
      return res.status(403).json({ message: "Only vendors can create ads" });
    }

    const { type, listingId, startDate, endDate } = req.body;

    if (type === "PRODUCT_PROMOTION" || type === "SEARCH_BOOST") {
      if (!listingId) {
        return res.status(400).json({ message: "Listing ID required for this ad type" });
      }
    }

    const ad = await prisma.ad.create({
      data: {
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        vendorId: req.user.id,
        listingId: listingId || null
      }
    });

    res.status(201).json(ad);
  } catch (e) {
    next(e);
  }
};

// Get active ads (for frontend display)
exports.getActiveAds = async (req, res, next) => {
  try {
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gte: now }
      },
      include: {
        vendor: { select: { id: true, storeName: true, coverImage: true } },
        listing: true
      }
    });

    res.json(ads);
  } catch (e) {
    next(e);
  }
};
// Get vendor's ads
exports.getVendorsAds = async (req, res, next) => {
  try {
    const ads = await prisma.ad.findMany({
      where: { vendorId: req.user.id },
      include: {
        listing: true
      }
    });
    res.json(ads);
  } catch (e) {
    next(e);
  }
};
