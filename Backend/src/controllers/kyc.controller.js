const prisma = require('../lib/prisma');

exports.submitKYC = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      tiktokHandle,
      instagramHandle,
      facebookPage,
      twitterHandle,
      otherSocial,
      referralCode,
    } = req.body;

    if (!tiktokHandle && !instagramHandle && !facebookPage && !twitterHandle && !otherSocial) {
      return res.status(400).json({
        success: false,
        message: 'At least one social media link or handle is required',
      });
    }

    const existingKYC = await prisma.vendorKYC.findUnique({
      where: { vendorId },
    });

    if (existingKYC) {
      return res.status(400).json({
        success: false,
        message: 'KYC has already been submitted for this vendor',
      });
    }

    let hasReferral = false;
    let referral;

    if (referralCode) {
      referral = await prisma.referral.findUnique({ where: { code: referralCode } });
      if (!referral || !referral.isActive) {
        return res.status(400).json({ success: false, message: 'Invalid or inactive referral code' });
      }
      hasReferral = true;
    }

    const signupFee = hasReferral ? 3000 : 5000;

    const result = await prisma.$transaction(async (tx) => {
      const kyc = await tx.vendorKYC.create({
        data: {
          vendorId,
          tiktokHandle,
          instagramHandle,
          facebookPage,
          twitterHandle,
          otherSocial,
          signupFee,
          hasReferral,
          status: 'PENDING',
          paymentStatus: 'PENDING',
        },
      });

      if (hasReferral && referral) {
        const existingUse = await tx.referralUse.findFirst({
          where: {
            referralId: referral.id,
            vendorId,
          },
        });

        if (!existingUse) {
          await tx.referralUse.create({
            data: {
              referralId: referral.id,
              vendorId,
              status: 'PENDING',
              commission: 1000,
            },
          });

          await tx.referral.update({
            where: { id: referral.id },
            data: {
              totalReferrals: { increment: 1 },
            },
          });
        }
      }

      return kyc;
    });

    // TODO: Send notification to admin about new KYC submission (email/Slack/etc.)

    return res.status(201).json({
      success: true,
      message: 'KYC submitted! We will contact you via WhatsApp for an interview.',
      data: result,
    });
  } catch (error) {
    console.error('Error in submitKYC:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit KYC' });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const kyc = await prisma.vendorKYC.findUnique({
      where: { vendorId },
    });

    if (!kyc) {
      return res.json({ success: true, data: null });
    }

    return res.json({ success: true, data: kyc });
  } catch (error) {
    console.error('Error in getKYCStatus:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch KYC status' });
  }
};

exports.getAllKYCSubmissions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const where = status ? { status } : {};

    const [total, kycs] = await Promise.all([
      prisma.vendorKYC.count({ where }),
      prisma.vendorKYC.findMany({
        where,
        skip,
        take: limit,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              vendorProfile: {
                select: {
                  storeName: true,
                  storeAddress: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        page,
        limit,
        kycs,
      },
    });
  } catch (error) {
    console.error('Error in getAllKYCSubmissions:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch KYC submissions' });
  }
};

exports.updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, interviewScheduled, interviewCompleted, interviewNotes, rejectionReason } = req.body;
    const adminId = req.user.id;

    const data = { status };

    if (status === 'INTERVIEW_SCHEDULED' && interviewScheduled) {
      data.interviewScheduled = new Date(interviewScheduled);
    }

    if (status === 'INTERVIEW_COMPLETED') {
      if (interviewCompleted) data.interviewCompleted = new Date(interviewCompleted);
      data.interviewedBy = adminId;
      if (interviewNotes) data.interviewNotes = interviewNotes;
    }

    if (status === 'REJECTED') {
      data.rejectionReason = rejectionReason || 'KYC rejected by admin';
      // Cancel referral use if any
      const kyc = await prisma.vendorKYC.findUnique({ where: { id } });
      if (kyc && kyc.hasReferral) {
        await prisma.referralUse.updateMany({
          where: { vendorId: kyc.vendorId },
          data: { status: 'CANCELLED' },
        });
      }
    }

    const updated = await prisma.vendorKYC.update({
      where: { id },
      data,
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateKYCStatus:', error);
    return res.status(500).json({ success: false, message: 'Failed to update KYC status' });
  }
};

exports.processKYCPayment = async (req, res) => {
  try {
    const { id } = req.params; // KYC ID

    const result = await exports._processKYCPaymentInternal(id);

    return res.json({
      success: true,
      message: 'KYC payment processed successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in processKYCPayment:', error);
    return res.status(500).json({ success: false, message: 'Failed to process KYC payment' });
  }
};

// Internal helper so webhook can reuse logic (initial KYC payment)
exports._processKYCPaymentInternal = async (kycId) => {
  const kyc = await prisma.vendorKYC.findUnique({
    where: { id: kycId },
  });

  if (!kyc) {
    throw new Error('KYC record not found');
  }

  if (kyc.paymentStatus === 'SUCCESS') {
    return kyc;
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const updatedKYC = await tx.vendorKYC.update({
      where: { id: kycId },
      data: {
        paymentStatus: 'SUCCESS',
        status: 'APPROVED',
        paidAt: now,
        validUntil: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
        renewalCount: 0,
      },
    });

    const user = await tx.user.update({
      where: { id: kyc.vendorId },
      data: {
        isKYCVerified: true,
        listingLimit: -1,
        kycCompletedAt: now,
      },
    });

    await tx.vendorProfile.updateMany({
      where: { userId: kyc.vendorId },
      data: {
        canCreateUnlimitedListings: true,
        isVerified: true,
      },
    });

    if (kyc.hasReferral) {
      const referralUse = await tx.referralUse.findFirst({
        where: {
          vendorId: kyc.vendorId,
          status: 'PENDING',
        },
      });

      if (referralUse) {
        await tx.referralUse.update({
          where: { id: referralUse.id },
          data: {
            status: 'COMPLETED',
            commissionPaid: true,
          },
        });

        await tx.referral.update({
          where: { id: referralUse.referralId },
          data: {
            successfulReferrals: { increment: 1 },
            totalEarnings: { increment: referralUse.commission || 1000 },
          },
        });

        await tx.commissionPayment.create({
          data: {
            referralUseId: referralUse.id,
            userId: (await tx.referral.findUnique({ where: { id: referralUse.referralId } })).userId,
            amount: referralUse.commission || 1000,
            status: 'PENDING',
          },
        });
      }
    }

    return { kyc: updatedKYC, user };
  });

  return result;
};

// Internal helper for yearly KYC renewal payments
exports._processKYCRenewalPaymentInternal = async (kycId) => {
  const kyc = await prisma.vendorKYC.findUnique({
    where: { id: kycId },
  });

  if (!kyc) {
    throw new Error('KYC record not found');
  }

  if (kyc.paymentStatus !== 'SUCCESS') {
    throw new Error('Initial KYC payment must be completed before renewal');
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const currentValidUntil = kyc.validUntil ? new Date(kyc.validUntil) : now;
    const baseDate = currentValidUntil > now ? currentValidUntil : now;
    const nextValidUntil = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    const updatedKYC = await tx.vendorKYC.update({
      where: { id: kycId },
      data: {
        validUntil: nextValidUntil,
        renewalCount: { increment: 1 },
      },
    });

    const user = await tx.user.update({
      where: { id: kyc.vendorId },
      data: {
        isKYCVerified: true,
        listingLimit: -1,
        kycCompletedAt: kyc.kycCompletedAt || now,
      },
    });

    // No referral commissions for renewals – discount only applies to the first year

    await tx.vendorProfile.updateMany({
      where: { userId: kyc.vendorId },
      data: {
        canCreateUnlimitedListings: true,
        isVerified: true,
      },
    });

    return { kyc: updatedKYC, user };
  });

  return result;
};

exports.checkListingLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isKYCVerified: true,
        listingLimit: true,
        listings: {
          select: { id: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isKYCVerified || user.listingLimit === -1) {
      return next();
    }

    const currentCount = user.listings.length;

    if (currentCount >= user.listingLimit) {
      return res.status(403).json({
        success: false,
        message: 'You have reached the maximum of 3 listings. Complete KYC to unlock unlimited listings.',
      });
    }

    return next();
  } catch (error) {
    console.error('Error in checkListingLimit middleware:', error);
    return res.status(500).json({ success: false, message: 'Failed to validate listing limit' });
  }
};
