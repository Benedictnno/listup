const prisma = require('../lib/prisma');
const { sendKYCEmail } = require('../lib/email');

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
      cacNumber,
      documentType,
      documentUrl,
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
      // Allow resubmission only if previous KYC was rejected
      if (existingKYC.status !== 'REJECTED') {
        return res.status(400).json({
          success: false,
          message: 'KYC has already been submitted for this vendor',
        });
      }

      // Delete the rejected KYC to allow resubmission
      await prisma.vendorKYC.delete({
        where: { vendorId },
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
      const kycData = {
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
      };

      // Add CAC fields if provided
      if (cacNumber) {
        kycData.cacNumber = cacNumber;
      }
      if (documentType && documentUrl) {
        kycData.documentType = documentType;
        kycData.documentUrl = documentUrl; // Store base64 or cloud URL
      }

      const kyc = await tx.vendorKYC.create({
        data: kycData,
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

    // Send email notification
    const user = await prisma.user.findUnique({ where: { id: vendorId } });
    if (user?.email) {
      await sendKYCEmail(user.email, 'kycSubmitted', user.name);
    }

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
      return res.json({ success: true, data: { kyc: null } });
    }

    return res.json({ success: true, data: { kyc } });
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

    // Send email notifications based on status
    const kyc = await prisma.vendorKYC.findUnique({
      where: { id },
      include: {
        vendor: {
          select: { email: true, name: true }
        }
      }
    });

    if (kyc?.vendor?.email) {
      if (status === 'INTERVIEW_SCHEDULED' && interviewScheduled) {
        await sendKYCEmail(
          kyc.vendor.email,
          'interviewScheduled',
          kyc.vendor.name,
          interviewScheduled,
          req.body.adminWhatsAppNumber || 'TBD'
        );
      } else if (status === 'INTERVIEW_COMPLETED') {
        await sendKYCEmail(
          kyc.vendor.email,
          'kycApproved',
          kyc.vendor.name,
          kyc.signupFee
        );
      } else if (status === 'REJECTED') {
        await sendKYCEmail(
          kyc.vendor.email,
          'kycRejected',
          kyc.vendor.name,
          rejectionReason || 'Please contact support for details'
        );
      }
    }

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

        // Send referral reward email
        const referrer = await tx.user.findUnique({
          where: { id: (await tx.referral.findUnique({ where: { id: referralUse.referralId } })).userId }
        });
        if (referrer?.email) {
          await sendKYCEmail(
            referrer.email,
            'referralReward',
            referrer.name,
            user.name,
            referralUse.commission || 1000
          );
        }
      }
    }

    // Send verification complete email to vendor
    if (user?.email) {
      await sendKYCEmail(user.email, 'verificationComplete', user.name);
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
        vendorKYC: {
          select: {
            validUntil: true,
            paymentStatus: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const kyc = user.vendorKYC;

    if (kyc && user.isKYCVerified) {
      const now = new Date();
      const validUntil = kyc.validUntil ? new Date(kyc.validUntil) : null;

      if (validUntil && validUntil < now) {
        return res.status(403).json({
          success: false,
          message: 'Your KYC verification has expired. Please renew your subscription to continue creating listings.',
          expired: true,
          validUntil: kyc.validUntil,
          redirectTo: '/kyc/payment',
        });
      }

      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      if (validUntil && validUntil < thirtyDaysFromNow) {
        res.setHeader('X-KYC-Warning', 'KYC expiring soon');
        res.setHeader('X-KYC-Expires', kyc.validUntil);
      }

      return next();
    }

    if (user.listingLimit === -1) {
      return next();
    }

    const currentCount = user.listings.length;

    if (currentCount >= user.listingLimit) {
      return res.status(403).json({
        success: false,
        message: `You have reached the maximum of ${user.listingLimit} listings. Complete KYC verification to unlock unlimited listings.`,
        currentCount,
        limit: user.listingLimit,
        redirectTo: '/kyc/submit',
        kycStatus: kyc?.status || 'NOT_SUBMITTED',
      });
    }

    return next();
  } catch (error) {
    console.error('Error in checkListingLimit middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to validate listing limit'
    });
  }
};
