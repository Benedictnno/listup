const prisma = require('../lib/prisma');
const { sign } = require('../lib/jwt');
const { validationResult } = require('express-validator');

exports.upgradeToVendor = async (req, res) => {
  // Enforce express-validator rules declared on the route (lengths, types, etc.)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }

  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { vendorProfile: true },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'VENDOR') return res.status(400).json({ success: false, message: 'Already a vendor' });

    const { storeName, storeAddress, businessCategory, referralCode, phone } = req.body;

    if (!user.phone && !phone) {
      return res.status(400).json({
        success: false,
        message: 'A phone number is required before upgrading. Please provide it in the form.',
        requiresPhone: true,
      });
    }

    if (!storeName || !storeAddress || !businessCategory) {
      return res.status(400).json({
        success: false,
        message: 'Store name, store address, and business category are required',
      });
    }

    let referral = null;
    if (referralCode) {
      referral = await prisma.referral.findUnique({ where: { code: referralCode } });
      if (!referral || !referral.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive referral code' });
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const upgraded = await tx.user.update({
        where: { id: userId },
        data: {
          role: 'VENDOR',
          listingLimit: { increment: 5 },
          ...(phone && !user.phone ? { phone } : {}) // Save phone if provided and currently missing
        },
      });

      if (!user.vendorProfile) {
        await tx.vendorProfile.create({
          data: { userId, storeName: storeName.trim(), storeAddress: storeAddress.trim(), businessCategory: businessCategory.trim() },
        });
      } else {
        await tx.vendorProfile.update({
          where: { userId },
          data: { storeName: storeName.trim(), storeAddress: storeAddress.trim(), businessCategory: businessCategory.trim() },
        });
      }

      if (referral) {
        const existing = await tx.referralUse.findFirst({ where: { referralId: referral.id, vendorId: userId } });
        if (!existing) {
          await tx.referralUse.create({ data: { referralId: referral.id, vendorId: userId, status: 'PENDING', commission: 1000 } });
          await tx.referral.update({ where: { id: referral.id }, data: { totalReferrals: { increment: 1 } } });
        }
      }

      return upgraded;
    });

    // Send vendor welcome email (fire and forget)
    try {
      const { sendVendorPendingEmail } = require('../lib/email');
      sendVendorPendingEmail(user.email, user.name, storeName.trim()).catch(() => {});
    } catch (_) {}

    const newToken = sign({ id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: 'VENDOR' });

    res.cookie('accessToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: 'Your account has been upgraded to a vendor account.',
      data: { token: newToken, user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: 'VENDOR' } },
    });
  } catch (error) {
    console.error('Upgrade to vendor error:', error);
    return res.status(500).json({ success: false, message: 'Failed to upgrade account' });
  }
};

exports.checkUpgradeEligibility = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true, phone: true, isEmailVerified: true },
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'VENDOR') return res.json({ success: true, eligible: false, reason: 'already_vendor' });

    const checks = { emailVerified: user.isEmailVerified, hasPhone: !!user.phone };
    const eligible = checks.emailVerified && checks.hasPhone;

    return res.json({
      success: true,
      eligible,
      checks,
      missingItems: Object.entries(checks).filter(([, v]) => !v).map(([k]) => k),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};
