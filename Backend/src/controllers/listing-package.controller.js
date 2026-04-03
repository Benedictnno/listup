const prisma = require('../lib/prisma');

// ─── Admin: Get global listing package settings ──────────────────────────────
exports.getGlobalSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      // Auto-create defaults if the settings doc doesn't exist yet
      settings = await prisma.systemSettings.create({
        data: {
          listingPackagePrice: 1000,
          listingPackageCount: 3,
        },
      });
    }

    return res.json({
      success: true,
      data: {
        listingPackagePrice: settings.listingPackagePrice,
        listingPackageCount: settings.listingPackageCount,
        description: `Default: ₦${settings.listingPackagePrice.toLocaleString()} for ${settings.listingPackageCount} listing slots`,
      },
    });
  } catch (error) {
    console.error('Error fetching global listing package settings:', error);
    next(error);
  }
};

// ─── Admin: Update global listing package settings ───────────────────────────
exports.updateGlobalSettings = async (req, res, next) => {
  try {
    const { listingPackagePrice, listingPackageCount } = req.body;

    if (listingPackagePrice !== undefined && (isNaN(listingPackagePrice) || listingPackagePrice <= 0)) {
      return res.status(400).json({ success: false, message: 'listingPackagePrice must be a positive number' });
    }

    if (listingPackageCount !== undefined && (!Number.isInteger(Number(listingPackageCount)) || listingPackageCount < 1)) {
      return res.status(400).json({ success: false, message: 'listingPackageCount must be a positive integer' });
    }

    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          listingPackagePrice: listingPackagePrice ?? 1000,
          listingPackageCount: listingPackageCount ?? 3,
        },
      });
    } else {
      const updateData = {};
      if (listingPackagePrice !== undefined) updateData.listingPackagePrice = Number(listingPackagePrice);
      if (listingPackageCount !== undefined) updateData.listingPackageCount = Number(listingPackageCount);

      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    return res.json({
      success: true,
      message: 'Global listing package settings updated',
      data: {
        listingPackagePrice: settings.listingPackagePrice,
        listingPackageCount: settings.listingPackageCount,
      },
    });
  } catch (error) {
    console.error('Error updating global listing package settings:', error);
    next(error);
  }
};

// ─── Admin: Get a vendor's override pricing ───────────────────────────────────
exports.getVendorPackageOverride = async (req, res, next) => {
  try {
    const { vendorId } = req.params;

    const [profile, settings] = await Promise.all([
      prisma.vendorProfile.findUnique({
        where: { userId: vendorId },
        select: {
          customListingPackagePrice: true,
          customListingPackageCount: true,
          userId: true,
          storeName: true,
        },
      }),
      prisma.systemSettings.findFirst(),
    ]);

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const effectivePrice = profile.customListingPackagePrice ?? settings?.listingPackagePrice ?? 1000;
    const effectiveCount = profile.customListingPackageCount ?? settings?.listingPackageCount ?? 3;

    return res.json({
      success: true,
      data: {
        vendorId,
        storeName: profile.storeName,
        customListingPackagePrice: profile.customListingPackagePrice,
        customListingPackageCount: profile.customListingPackageCount,
        effectivePrice,
        effectiveCount,
        usingCustomPrice: profile.customListingPackagePrice !== null,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor package override:', error);
    next(error);
  }
};

// ─── Admin: Set (or clear) a vendor's override pricing ───────────────────────
exports.setVendorPackageOverride = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { customListingPackagePrice, customListingPackageCount } = req.body;

    // null means "clear the override and fall back to global"
    if (
      customListingPackagePrice !== null &&
      customListingPackagePrice !== undefined &&
      (isNaN(customListingPackagePrice) || customListingPackagePrice <= 0)
    ) {
      return res.status(400).json({ success: false, message: 'customListingPackagePrice must be a positive number or null' });
    }

    if (
      customListingPackageCount !== null &&
      customListingPackageCount !== undefined &&
      (!Number.isInteger(Number(customListingPackageCount)) || customListingPackageCount < 1)
    ) {
      return res.status(400).json({ success: false, message: 'customListingPackageCount must be a positive integer or null' });
    }

    const profile = await prisma.vendorProfile.findUnique({ where: { userId: vendorId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    const updateData = {};
    if (customListingPackagePrice !== undefined) {
      updateData.customListingPackagePrice = customListingPackagePrice === null ? null : Number(customListingPackagePrice);
    }
    if (customListingPackageCount !== undefined) {
      updateData.customListingPackageCount = customListingPackageCount === null ? null : Number(customListingPackageCount);
    }

    const updated = await prisma.vendorProfile.update({
      where: { userId: vendorId },
      data: updateData,
      select: {
        customListingPackagePrice: true,
        customListingPackageCount: true,
        storeName: true,
        userId: true,
      },
    });

    return res.json({
      success: true,
      message: 'Vendor listing package override updated',
      data: updated,
    });
  } catch (error) {
    console.error('Error setting vendor package override:', error);
    next(error);
  }
};

// ─── Admin: Manually credit a vendor with listing slots (no payment required) ─
exports.creditVendorSlots = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const { slots } = req.body;

    if (!slots || !Number.isInteger(Number(slots)) || slots < 1) {
      return res.status(400).json({ success: false, message: 'slots must be a positive integer' });
    }

    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { id: true, name: true, listingLimit: true, role: true, isKYCVerified: true },
    });

    if (!user) return res.status(404).json({ success: false, message: 'Vendor not found' });
    if (user.role !== 'VENDOR') return res.status(400).json({ success: false, message: 'User is not a vendor' });

    // Guard: don't corrupt unlimited vendors
    if (user.isKYCVerified || user.listingLimit === -1) {
      return res.status(400).json({
        success: false,
        message: 'This vendor already has unlimited listings via KYC verification. Crediting slots is not needed.',
        currentLimit: user.listingLimit,
        isKYCVerified: user.isKYCVerified,
      });
    }

    const updated = await prisma.user.update({
      where: { id: vendorId },
      data: { listingLimit: { increment: Number(slots) } },
      select: { id: true, name: true, listingLimit: true },
    });

    return res.json({
      success: true,
      message: `Credited ${slots} listing slot(s) to ${user.name}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error crediting vendor slots:', error);
    next(error);
  }
};
