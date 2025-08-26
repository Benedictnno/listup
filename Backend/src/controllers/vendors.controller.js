const prisma = require('../lib/prisma');

exports.getVendorProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const vendor = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        storeName: true,
        storeAddress: true,
        businessCategory: true,
        coverImage: true,
        createdAt: true,
        listings: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            images: true,
            location: true,
            condition: true,
            createdAt: true,
            category: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!vendor || vendor.role !== "VENDOR") {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json(vendor);
  } catch (e) {
    next(e);
  }
};

// Update vendor profile
exports.updateVendorProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { storeName, storeAddress, businessCategory, coverImage } = req.body;

    // Verify user is a vendor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true }
    });

    if (!user || user.role !== "VENDOR") {
      return res.status(403).json({ message: "Access denied. Vendor account required." });
    }

    // Update vendor profile
    const updatedProfile = await prisma.vendorProfile.update({
      where: { userId },
      data: {
        storeName: storeName || undefined,
        storeAddress: storeAddress || undefined,
        businessCategory: businessCategory || undefined,
        coverImage: coverImage || undefined,
      }
    });

    res.json({
      success: true,
      message: "Vendor profile updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating vendor profile:', error);
    next(error);
  }
};

