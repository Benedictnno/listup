const prisma = require("../lib/prisma");

// Create a new ad
exports.createAd = async (req, res, next) => {
  try {
    console.log("=== AD CREATION REQUEST ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user.id);
    console.log("User role:", req.user.role);

    const { type, storeId, productId, startDate, endDate, amount } = req.body;

    // Validation
    if (!type || !startDate || !endDate || !amount) {
      console.log("❌ Validation failed - missing required fields");
      console.log("Type:", type);
      console.log("StartDate:", startDate);
      console.log("EndDate:", endDate);
      console.log("Amount:", amount);
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

    console.log("✅ Basic data prepared:", data);

    if (type === "STOREFRONT") {
      if (!storeId) {
        console.log("❌ Store ID missing for STOREFRONT ad");
        return res.status(400).json({ message: "Store ID required" });
      }
      data.storeId = storeId;
      console.log("✅ Store ID added:", storeId);
    }

    if (type === "PRODUCT_PROMOTION") {
      if (!productId) {
        console.log("❌ Product ID missing for PRODUCT_PROMOTION ad");
        return res.status(400).json({ message: "Product ID required" });
      }
      data.productId = productId;
      console.log("✅ Product ID added:", productId);
    }

    if (type === "SEARCH_BOOST") {
      data.appliesToAllProducts = true;
      console.log("✅ SEARCH_BOOST - applies to all products");
    }

    console.log("🎯 Final data object for Prisma:", JSON.stringify(data, null, 2));

    // Create the ad
    console.log("🚀 Attempting to create ad with Prisma...");
    const ad = await prisma.ad.create({ data });
    
    console.log("✅ Ad created successfully!");
    console.log("Created ad:", JSON.stringify(ad, null, 2));

    res.status(201).json(ad);
  } catch (e) {
    console.error("❌ ERROR CREATING AD:");
    console.error("Error type:", e.constructor.name);
    console.error("Error message:", e.message);
    console.error("Error code:", e.code);
    console.error("Error details:", e);
    
    if (e.code === 'P2002') {
      return res.status(400).json({ message: "Ad already exists" });
    }
    
    // Send detailed error for debugging
    res.status(500).json({ 
      message: "Failed to create ad", 
      error: e.message,
      code: e.code 
    });
  }
};


// Get all ads (for debugging - remove in production)
exports.getAllAds = async (req, res, next) => {
  try {
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

    console.log(`Total ads found: ${ads.length}`);
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
    console.log(`Fetching active ads at: ${now.toISOString()}`);
    
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

    console.log(`Found ${ads.length} active ads`);
    res.json(ads);
  } catch (e) {
    console.error("Error fetching active ads:", e);
    next(e);
  }
};

// Get vendor's ads
exports.getVendorsAds = async (req, res, next) => {
  try {
    const ads = await prisma.ad.findMany({
      where: { vendorId: req.user.id },
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
    const { id } = req.params;
    const { status } = req.body;

    const ad = await prisma.ad.update({
      where: { id },
      data: { status },
    });

    res.json(ad);
  } catch (e) {
    console.error("Error updating ad status:", e);
    next(e);
  }
};

// Get ads by vendor ID
exports.getAdsByVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    console.log(`🔍 Fetching ads for vendor: ${vendorId}`);

    const ads = await prisma.ad.findMany({
      where: { vendorId },
      include: {
        store: {
          select: {
            id: true,
            storeName: true,
            businessCategory: true,
          }
        },
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Found ${ads.length} ads for vendor ${vendorId}`);
    res.json(ads);
  } catch (e) {
    console.error(`❌ Error fetching ads for vendor ${req.params.vendorId}:`, e);
    res.status(500).json({ 
      message: "Failed to fetch vendor ads",
      error: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error'
    });
  }
};