const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

exports.getAll = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, categoryId } = req.query;
    const take = Math.min(parseInt(limit), 50);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    const filters = {};
    // Only filter active listings, and optionally by category
    // filters.isActive = true; // Use this if you only want active listings
    if (categoryId) filters.categoryId = categoryId;

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where: filters,
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
          condition: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              vendorProfile: {
                select: {
                  storeName: true,
                  logo: true,
                  coverImage: true
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
          price: true,
          images: true,
          location: true,
          condition: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              vendorProfile: {
                select: {
                  storeName: true,
                  logo: true,
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
        seller: {
          select: {
            id: true,
            name: true,
            phone: true,
            profileImage: true,
            vendorProfile: {
              select: {
                storeName: true,
                logo: true,
                coverImage: true
              }
            }
          }
        }
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

        sellerId: req.user.id,
        categoryId,             // 👈 assign categoryId
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
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

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
        phone: true,
        profileImage: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            coverImage: true,
            logo: true,
            storeDescription: true,
            businessHours: true,
            socialMedia: true,
            isVerified: true,
            storeAnnouncement: true
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
        orderBy: (() => {
          let orders = [{ boostScore: "desc" }];
          if (sort === "price_asc") orders.push({ price: "asc" });
          else if (sort === "popular") orders.push({ ListingView: { _count: "desc" } });
          else orders.push({ createdAt: "desc" });
          return orders;
        })(),
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
          coverImage: vendor.vendorProfile?.coverImage,
          logo: vendor.vendorProfile?.logo,
          storeDescription: vendor.vendorProfile?.storeDescription,
          businessHours: vendor.vendorProfile?.businessHours,
          socialMedia: vendor.vendorProfile?.socialMedia,
          isVerified: vendor.vendorProfile?.isVerified,
          storeAnnouncement: vendor.vendorProfile?.storeAnnouncement,
          phone: vendor.phone,
          profileImage: vendor.profileImage
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
    const { page = 1, limit = 20, sort = 'newest' } = req.query;

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
        phone: true,
        profileImage: true,
        vendorProfile: {
          select: {
            storeName: true,
            storeAddress: true,
            businessCategory: true,
            coverImage: true,
            logo: true,
            storeDescription: true,
            businessHours: true,
            socialMedia: true,
            isVerified: true,
            storeAnnouncement: true
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
        orderBy: (() => {
          let orders = [{ boostScore: "desc" }];
          if (sort === "price_asc") orders.push({ price: "asc" });
          else if (sort === "popular") orders.push({ ListingView: { _count: "desc" } });
          else orders.push({ createdAt: "desc" });
          return orders;
        })(),
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
          coverImage: vendor.vendorProfile?.coverImage,
          logo: vendor.vendorProfile?.logo,
          storeDescription: vendor.vendorProfile?.storeDescription,
          businessHours: vendor.vendorProfile?.businessHours,
          socialMedia: vendor.vendorProfile?.socialMedia,
          isVerified: vendor.vendorProfile?.isVerified,
          storeAnnouncement: vendor.vendorProfile?.storeAnnouncement,
          phone: vendor.phone,
          profileImage: vendor.profileImage
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




// Admin-only endpoints

// Get all listings for admin (with vendor info, filters, pagination)
exports.getAllListingsAdmin = async (req, res, next) => {
  try {
    const {
      limit = 20,
      page = 1,
      status,
      categoryId,
      vendorId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const take = Math.min(parseInt(limit), 100);
    const skip = (Math.max(parseInt(page), 1) - 1) * take;

    // Build filters
    const filters = {};
    if (status) {
      if (status === 'active') filters.isActive = true;
      else if (status === 'inactive') filters.isActive = false;
    }
    if (categoryId) filters.categoryId = categoryId;
    if (vendorId) filters.sellerId = vendorId;
    if (search) {
      filters.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build sort
    const orderBy = {};
    if (sortBy === 'price') orderBy.price = sortOrder;
    else if (sortBy === 'title') orderBy.title = sortOrder;
    else orderBy.createdAt = sortOrder;

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where: filters,
        orderBy,
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
          isActive: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: { id: true, name: true, slug: true }
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
              vendorProfile: {
                select: {
                  storeName: true,
                  storeAddress: true
                }
              }
            }
          }
        }
      }),
      prisma.listing.count({ where: filters })
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / take),
          limit: take
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update any listing (admin bypass ownership check)
exports.updateListingAdmin = async (req, res, next) => {
  try {
    const exists = await prisma.listing.findUnique({
      where: { id: req.params.id }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    const listing = await prisma.listing.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        seller: {
          select: {
            id: true,
            name: true,
            vendorProfile: {
              select: { storeName: true }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: listing
    });
  } catch (e) {
    next(e);
  }
};

// Delete any listing (admin bypass ownership check)
exports.deleteListingAdmin = async (req, res, next) => {
  try {
    const exists = await prisma.listing.findUnique({
      where: { id: req.params.id }
    });

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found'
      });
    }

    await prisma.listing.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Listing deleted successfully'
    });
  } catch (e) {
    next(e);
  }
};

// Bulk actions on listings
exports.bulkActionAdmin = async (req, res, next) => {
  try {
    const { listingIds, action } = req.body;

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'listingIds array is required'
      });
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be: activate, deactivate, or delete'
      });
    }

    let result;
    if (action === 'activate') {
      result = await prisma.listing.updateMany({
        where: { id: { in: listingIds } },
        data: { isActive: true, updatedAt: new Date() }
      });
    } else if (action === 'deactivate') {
      result = await prisma.listing.updateMany({
        where: { id: { in: listingIds } },
        data: { isActive: false, updatedAt: new Date() }
      });
    } else if (action === 'delete') {
      result = await prisma.listing.deleteMany({
        where: { id: { in: listingIds } }
      });
    }

    res.json({
      success: true,
      message: `Successfully ${action}d ${result.count} listing(s)`,
      count: result.count
    });
  } catch (e) {
    next(e);
  }
};
