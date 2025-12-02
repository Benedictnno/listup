const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

exports.getAll = async (req, res, next) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        orderBy: [
          { boostScore: "desc" },
          { createdAt: "desc" },
        ],
        skip, 
        take,
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          location: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              name: true,
              vendorProfile: {
                select: {
                  coverImage: true
                }
              }
            }
          }
        }
      }),
      prisma.listing.count()
    ]);

    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (err) {
    next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const { q, categoryId, minPrice, maxPrice, limit = 20, page = 1 } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    const filters = { isActive: true };
    if (categoryId) filters.categoryId = categoryId;
    if (q) filters.title = { contains: q, mode: 'insensitive' };

    // price filter (Mongo Decimal)
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.gte = parseFloat(minPrice);
      if (maxPrice) filters.price.lte = parseFloat(maxPrice);
    }

  const [items, total] = await Promise.all([
  prisma.listing.findMany({
    where: filters,
    orderBy: [
      { boostScore: "desc" },
      { createdAt: "desc" },
    ],
    skip, take,
    select: {
      id: true,
      title: true,
      price: true,
      images: true,
      location: true,
      createdAt: true,
      category: {
        select: { id: true, name: true, slug: true }
      },
      seller: {
        select: {
          id: true,
          name: true,
          vendorProfile: {
            select: {
              coverImage: true   // ✅ only fetch cover image
            }
          }
        }
      }
    }
  }),
  prisma.listing.count({ where: filters })
]);


    res.json({
      items,
      total,
      page: Number(page),
      pages: Math.ceil(total / take)
    });
  } catch (e) {
    next(e);
  }
};

exports.getOne = async (req, res, next) => {
 
  try {
    const item = await prisma.listing.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, title: true, description: true, price: true, images: true, location: true,
        condition: true, createdAt: true, isActive: true,
        category: { select: { id: true, name: true, slug: true } },
        seller:   { select: { id: true, name: true, phone: true } }
      }
    });
    if (!item) return res.status(404).json({ message: 'Listing not found' });
    res.json(item);
  } catch (e) { next(e) }
};

exports.create = async (req, res, next) => {
  try {
    // Defensive auth checks in case middleware is misconfigured upstream
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    if (req.user.role !== 'VENDOR') return res.status(403).json({ message: 'Only vendors may create listings' });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, price, images = [], location, condition, categoryId } = req.body;

    if (!title || !price || !categoryId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: Number(price),
        location: location || "none",
        condition,
       
        sellerId: req.user.id,   // 👈 correct field
        images,                 // 👈 directly pass array of URLs
      },
    });

    res.status(201).json(listing);
  } catch (e) {
    next(e);
  }
};


exports.update = async (req, res, next) => {
  try {
    const exists = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ message: 'Listing not found' });
    if (exists.sellerId !== req.user.id) return res.status(403).json({ message: 'Not your listing' });

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: { ...req.body, updatedAt: new Date() }
    });
    res.json(listing);
  } catch (e) { next(e); }
};

exports.remove = async (req, res, next) => {
  try {
    const exists = await prisma.listing.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ message: 'Listing not found' });
    if (exists.sellerId !== req.user.id) return res.status(403).json({ message: 'Not your listing' });

    await prisma.listing.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
};

exports.getByVendorId = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Optional: prevent vendors from accessing other vendors' data
    if (req.user.id !== vendorId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const listings = await prisma.listing.findMany({
      where: { sellerId: vendorId }
      // include: {
      //   vendor: true, // optional, if you want vendor details returned
      // },
    });

    res.json(listings);
  } catch (error) {
    console.error("Error fetching vendor listings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Public endpoint to get all listings for a specific vendor
exports.getPublicVendorListings = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    // First, verify the vendor exists and get their profile
    const vendor = await prisma.user.findUnique({
      where: { 
        id: vendorId,
        role: 'VENDOR'
      },
      select: {
        id: true,
        name: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            coverImage: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: 'Vendor not found' 
      });
    }

    // Get vendor's active listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { 
          sellerId: vendorId,
          isActive: true // Only show active listings
        },
        orderBy: [
          { boostScore: "desc" },
          { createdAt: "desc" }
        ],
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          location: true,
          condition: true,
          createdAt: true,
          category: {
            select: { 
              id: true, 
              name: true, 
              slug: true 
            }
          }
        }
      }),
      prisma.listing.count({ 
        where: { 
          sellerId: vendorId,
          isActive: true 
        } 
      })
    ]);

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          storeName: vendor.vendorProfile?.storeName,
          storeAddress: vendor.vendorProfile?.storeAddress,
          businessCategory: vendor.vendorProfile?.businessCategory,
          coverImage: vendor.vendorProfile?.coverImage
        },
        listings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / take),
          limit: take
        }
      }
    });

  } catch (error) {
    console.error("Error fetching public vendor listings:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching vendor listings" 
    });
  }
};

// Public endpoint to get vendor listings by store name (more user-friendly)
exports.getVendorListingsByStore = async (req, res) => {
  try {
    const { storeName } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    // Find vendor by store name
    const vendor = await prisma.user.findFirst({
      where: { 
        role: 'VENDOR',
        vendorProfile: {
          storeName: {
            contains: storeName,
            mode: 'insensitive' // Case-insensitive search
          }
        }
      },
      select: {
        id: true,
        name: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            coverImage: true
          }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ 
        success: false,
        message: 'Store not found' 
      });
    }

    // Get vendor's active listings
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { 
          sellerId: vendor.id,
          isActive: true
        },
        orderBy: [
          { boostScore: "desc" },
          { createdAt: "desc" }
        ],
        skip,
        take,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          images: true,
          location: true,
          condition: true,
          createdAt: true,
          category: {
            select: { 
              id: true, 
              name: true, 
              slug: true 
            }
          }
        }
      }),
      prisma.listing.count({ 
        where: { 
          sellerId: vendor.id,
          isActive: true 
        } 
      })
    ]);

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendor.id,
          name: vendor.name,
          storeName: vendor.vendorProfile?.storeName,
          storeAddress: vendor.vendorProfile?.storeAddress,
          businessCategory: vendor.vendorProfile?.businessCategory,
          coverImage: vendor.vendorProfile?.coverImage
        },
        listings,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / take),
          limit: take
        }
      }
    });

  } catch (error) {
    console.error("Error fetching vendor listings by store:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching vendor listings" 
    });
  }
};


