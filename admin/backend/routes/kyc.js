const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');
// Use the local email service in the admin backend
const { sendKYCEmail } = require('../lib/email');

const router = express.Router();

// Get all KYC submissions
router.get('/admin/submissions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const take = Math.min(parseInt(limit), 50);
        const skip = (Math.max(parseInt(page), 1) - 1) * take;

        // Build where clause for VendorKYC
        const where = {};

        // Filter by status
        if (status && status !== 'ALL') {
            where.status = status;
        }

        // Search logic
        if (search) {
            where.OR = [
                // Search in related Vendor (User) fields
                { vendor: { name: { contains: search, mode: 'insensitive' } } },
                { vendor: { email: { contains: search, mode: 'insensitive' } } },
                { vendor: { phone: { contains: search, mode: 'insensitive' } } },
                // Search in vendorProfile storeName
                { vendor: { vendorProfile: { storeName: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        const [kycs, total] = await Promise.all([
            prisma.vendorKYC.findMany({
                where,
                skip,
                take,
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
                                    // Including social media to fill gaps if KYC doesn't have them but profile does
                                    socialMedia: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.vendorKYC.count({ where })
        ]);

        // Map to expected frontend format
        const mappedKycs = kycs.map(kyc => {
            // Fallback to profile socials if KYC socials are empty (migration support)
            const profileSocials = kyc.vendor?.vendorProfile?.socialMedia || {};

            return {
                id: kyc.id, // Use KYC ID, not Profile ID
                vendorId: kyc.vendorId,
                status: kyc.status,
                paymentStatus: kyc.paymentStatus,
                signupFee: kyc.signupFee,
                hasReferral: kyc.hasReferral,

                // Socials
                tiktokHandle: kyc.tiktokHandle,
                instagramHandle: kyc.instagramHandle || profileSocials.instagram,
                facebookPage: kyc.facebookPage || profileSocials.facebook,
                twitterHandle: kyc.twitterHandle || profileSocials.twitter,
                otherSocial: kyc.otherSocial || profileSocials.linkedin,

                // Documents
                cacNumber: kyc.cacNumber,
                documentUrl: kyc.documentUrl,
                documentType: kyc.documentType,

                // Dates & Notes
                createdAt: kyc.createdAt,
                updatedAt: kyc.updatedAt,
                interviewScheduled: kyc.interviewScheduled,
                interviewCompleted: kyc.interviewCompleted,
                interviewNotes: kyc.interviewNotes,
                rejectionReason: kyc.rejectionReason,

                // Vendor Info
                vendor: {
                    id: kyc.vendor.id,
                    name: kyc.vendor.name,
                    email: kyc.vendor.email,
                    phone: kyc.vendor.phone,
                    vendorProfile: {
                        storeName: kyc.vendor.vendorProfile?.storeName,
                        storeAddress: kyc.vendor.vendorProfile?.storeAddress,
                    }
                }
            };
        });

        res.json({
            success: true,
            data: {
                kycs: mappedKycs,
                total,
                page: Number(page),
                limit: take
            }
        });

    } catch (error) {
        console.error('Get KYC submissions error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching KYC submissions'
        });
    }
});

// Update KYC status
router.patch('/admin/:id/status', auth, async (req, res) => {
    try {
        const { id } = req.params; // This is now the KYC ID
        const { status, interviewScheduled, interviewCompleted, interviewNotes, rejectionReason } = req.body;
        const adminId = req.user.id;

        const kyc = await prisma.vendorKYC.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: { email: true, name: true }
                }
            }
        });

        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: 'KYC submission not found'
            });
        }

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
            // Logic to cancel referral use if needed
            if (kyc.hasReferral) {
                await prisma.referralUse.updateMany({
                    where: { vendorId: kyc.vendorId },
                    data: { status: 'CANCELLED' },
                });
            }
            // Also reject the VendorProfile if it exists and was pending
            await prisma.vendorProfile.updateMany({
                where: { userId: kyc.vendorId },
                data: {
                    verificationStatus: 'REJECTED',
                    rejectionReason: rejectionReason || 'KYC rejected by admin',
                    isVerified: false
                }
            });
        }

        // Apply update
        const updated = await prisma.vendorKYC.update({
            where: { id },
            data,
        });

        // Update VendorProfile status string for consistency (but not isVerified yet)
        if (status !== 'REJECTED') { // Rejected is handled above
            await prisma.vendorProfile.updateMany({
                where: { userId: kyc.vendorId },
                data: { verificationStatus: status }
            });
        }

        // Email Notifications
        if (kyc.vendor?.email) {
            if (status === 'INTERVIEW_SCHEDULED' && interviewScheduled) {
                await sendKYCEmail(
                    kyc.vendor.email,
                    'interviewScheduled',
                    kyc.vendor.name,
                    interviewScheduled,
                    'Check your email or dashboard' // Phone not readily available in request, can be enhanced
                );
            } else if (status === 'INTERVIEW_COMPLETED') {
                await sendKYCEmail(
                    kyc.vendor.email,
                    'kycApproved', // Using kycApproved template for 'passed interview / ready for payment'
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

        res.json({
            success: true,
            data: updated,
            message: `KYC status updated to ${status}`
        });

    } catch (error) {
        console.error('Update KYC status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating KYC status'
        });
    }
});

// Process Payment (Manual Admin Override)
router.post('/admin/:id/payment', auth, async (req, res) => {
    try {
        const { id } = req.params; // KYC ID

        const kyc = await prisma.vendorKYC.findUnique({
            where: { id },
            include: {
                vendor: true
            }
        });

        if (!kyc) {
            return res.status(404).json({ success: false, message: 'KYC record not found' });
        }

        if (kyc.paymentStatus === 'SUCCESS') {
            return res.status(400).json({ success: false, message: 'Payment already completed' });
        }

        const now = new Date();

        // Transaction to ensure all side effects (referrals, profile verification) happen atomically
        const result = await prisma.$transaction(async (tx) => {
            const updatedKYC = await tx.vendorKYC.update({
                where: { id },
                data: {
                    paymentStatus: 'SUCCESS',
                    status: 'APPROVED',
                    paidAt: now,
                    validUntil: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year
                    renewalCount: 0,
                },
            });

            // Verify User
            const user = await tx.user.update({
                where: { id: kyc.vendorId },
                data: {
                    isKYCVerified: true,
                    listingLimit: -1, // Unlimited
                    kycCompletedAt: now,
                },
            });

            // Verify Vendor Profile
            await tx.vendorProfile.updateMany({
                where: { userId: kyc.vendorId },
                data: {
                    canCreateUnlimitedListings: true,
                    isVerified: true,
                    verificationStatus: 'APPROVED',
                    verifiedAt: now,
                    verifiedBy: req.user.id
                },
            });

            // Handle Referrals
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

                    // Log commission payment
                    const referral = await tx.referral.findUnique({ where: { id: referralUse.referralId } });
                    if (referral) {
                        await tx.commissionPayment.create({
                            data: {
                                referralUseId: referralUse.id,
                                userId: referral.userId,
                                amount: referralUse.commission || 1000,
                                status: 'PENDING', // PENDING payout to referrer
                            },
                        });

                        // Send referral reward email
                        const referrer = await tx.user.findUnique({ where: { id: referral.userId } });
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
            }

            // Send verification complete email to vendor
            if (kyc.vendor?.email) {
                await sendKYCEmail(kyc.vendor.email, 'verificationComplete', kyc.vendor.name);
            }

            return { kyc: updatedKYC, user };
        });

        res.json({
            success: true,
            message: 'Payment processed and vendor verified successfully',
            data: result
        });

    } catch (error) {
        console.error('Process KYC payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing payment'
        });
    }
});

module.exports = router;
