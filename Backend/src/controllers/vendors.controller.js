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

