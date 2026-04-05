const prisma = require("../lib/prisma");

// Create a new ad
exports.createAd = async (req, res, next) => {
  try {
    // Defensive auth checks in case the auth middleware is bypassed
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'VENDOR') {
      return res.status(403).json({ message: 'Only vendors may create ads' });
    }

    const { type, storeId, productId, startDate, endDate, amount } = req.body;

    if (!type || !startDate || !endDate || !amount) {
      return res.status(400).json({ 
        message: "Type, startDate, endDate, and amount are required" 
      });
    }

    let data = {
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      vendorId: req.user.id,
      amount: parseFloat(amount),
      status: "PENDING",
      paymentStatus: "PENDING",
    };

    if (type === "STOREFRONT") {
      if (!storeId) {
        return res.status(400).json({ message: "Store ID required" });
      }
      data.storeId = storeId;
    }

    if (type === "PRODUCT_PROMOTION") {
      if (!productId) {
        return res.status(400).json({ message: "Product ID required" });
      }
      data.productId = productId;
    }

    if (type === "SEARCH_BOOST") {
      data.appliesToAllProducts = true;
    }

    const ad = await prisma.ad.create({ data });
    res.status(201).json(ad);
  } catch (e) {
    console.error("Error creating ad:", e.message, e.code);
    
    if (e.code === 'P2002') {
      return res.status(400).json({ message: "Ad already exists" });
    }
    
    res.status(500).json({ 
      message: "Failed to create ad",
      error: process.env.NODE_ENV === 'development' ? e.message : undefined,
    });
  }
};


// Get all ads (for debugging - remove in production)
// Get all ads (locked to admin)
exports.getAllAds = async (req, res, next) => {
  try {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ message: "Admin access required" });
    }
    const ads = await prisma.ad.findMany({
      select: {
        id: true,
        type: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        vendorId: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });


    res.json(ads);
  } catch (e) {
    console.error("Error fetching all ads:", e);
    next(e);
  }
};

// Get active ads
exports.getActiveAds = async (req, res, next) => {
  try {
    const now = new Date();
    
    
    const ads = await prisma.ad.findMany({
      where: {
        status: "ACTIVE",
        paymentStatus: "SUCCESS",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        vendor: { 
          select: { 
            id: true, 
            name: true, 
            email: true 
          } 
        },
        store: {
          select: {
            id: true,
            storeName: true,
            businessCategory: true,
            coverImage: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            location: true,
            condition: true,
            images: true
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

   
    res.json(ads);
  } catch (e) {
    console.error("Error fetching active ads:", e);
    next(e);
  }
};

// Get vendor's ads
exports.getAdsByVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    
    // Security check: only admins or the vendor themselves can view these ads
    if (req.user.role !== 'ADMIN' && req.user.id !== vendorId) {
        return res.status(403).json({ message: "Unauthorized to view these ads" });
    }

    const ads = await prisma.ad.findMany({
      where: { vendorId: vendorId },
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            businessCategory: true,
            coverImage: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            location: true,
            condition: true,
            images: true
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ads);
  } catch (e) {
    console.error("Error fetching vendor ads:", e);
    next(e);
  }
};

// Get specific ad by ID
exports.getAdById = async (req, res, next) => {
  try {
    const { adId } = req.params;
    
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: {
        vendor: { select: { id: true, name: true, email: true } },
        store: {
          select: {
            id: true,
            storeName: true,
            businessCategory: true,
            coverImage: true
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            location: true,
            condition: true,
            images: true
          }
        },
      },
    });

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Check if user can access this ad
    if (ad.vendorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(ad);
  } catch (e) {
    console.error("Error fetching ad by ID:", e);
    next(e);
  }
};

// Update ad status
exports.updateAdStatus = async (req, res, next) => {
  try {
    const { adId } = req.params;
    const { status } = req.body;

    const ad = await prisma.ad.findUnique({
      where: { id: adId }
    });

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.vendorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Unauthorized to update this ad" });
    }

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: { status },
    });

    res.json(updatedAd);
  } catch (e) {
    console.error("Error updating ad status:", e);
    next(e);
  }
};
