const express = require('express');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all KYC submissions
router.get('/admin/submissions', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search } = req.query;
        const take = Math.min(parseInt(limit), 50);
        const skip = (Math.max(parseInt(page), 1) - 1) * take;

        // Build where clause for VendorProfile
        const where = {};

        // Filter by status
        if (status && status !== 'ALL') {
            where.verificationStatus = status;
        } else {
            // If no specific status, show all except maybe completely empty ones?
            // Actually frontend wants everything.
        }

        // Search logic
        if (search) {
            where.OR = [
                { storeName: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phone: { contains: search, mode: 'insensitive' } } }
            ];
        }

        // Fetch profiles without including user to avoid Prisma validation errors on null relations
        const [profiles, total] = await Promise.all([
            prisma.vendorProfile.findMany({
                where,
                skip,
                take,
                include: {
                    socialMedia: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.vendorProfile.count({ where })
        ]);

        // Get all unique user IDs
        const userIds = profiles.map(p => p.userId).filter(Boolean);

        // Fetch users and their KYC data separately
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                vendorKYC: true
            }
        });

        // Create a map for quick lookup
        const userMap = new Map(users.map(u => [u.id, u]));

        // Filter out orphaned profiles and map to KYCSubmission interface
        const kycs = profiles
            .filter(profile => userMap.has(profile.userId)) // Only include profiles with valid users
            .map(profile => {
                const user = userMap.get(profile.userId);

                // Determine payment status based on verification
                let paymentStatus = 'PENDING';
                if (profile.verificationStatus === 'APPROVED') {
                    paymentStatus = 'SUCCESS';
                }

                const kycData = user.vendorKYC;

                return {
                    id: profile.id,
                    vendorId: profile.userId,
                    status: profile.verificationStatus || 'PENDING',
                    paymentStatus: paymentStatus,
                    signupFee: 5000,
                    hasReferral: kycData?.hasReferral || false,
                    tiktokHandle: kycData?.tiktokHandle || null,
                    instagramHandle: kycData?.instagramHandle || profile.socialMedia?.instagram || null,
                    facebookPage: kycData?.facebookPage || profile.socialMedia?.facebook || null,
                    twitterHandle: kycData?.twitterHandle || profile.socialMedia?.twitter || null,
                    otherSocial: kycData?.otherSocial || profile.socialMedia?.linkedin || null,
                    cacNumber: kycData?.cacNumber || null,
                    documentUrl: kycData?.documentUrl || null,
                    documentType: kycData?.documentType || null,
                    createdAt: profile.createdAt,
                    updatedAt: profile.updatedAt,
                    interviewScheduled: kycData?.interviewScheduled || null,
                    interviewCompleted: kycData?.interviewCompleted || null,
                    interviewNotes: kycData?.interviewNotes || null,
                    rejectionReason: profile.rejectionReason,
                    vendor: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        vendorProfile: {
                            storeName: profile.storeName,
                            storeAddress: profile.addressId ? 'Address linked' : null
                        }
                    }
                };
            });

        res.json({
            success: true,
            data: {
                kycs,
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
        const { id } = req.params;
        const { status, interviewScheduled, interviewCompleted, interviewNotes, rejectionReason } = req.body;

        const profile = await prisma.vendorProfile.findUnique({
            where: { id }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'KYC submission not found'
            });
        }

        // Update data
        const updateData = {
            verificationStatus: status,
            updatedAt: new Date()
        };

        if (status === 'APPROVED') {
            // APPROVED means documents are okay, but payment is needed.
            // Do NOT set isVerified = true yet.
            updateData.isVerified = false;
            updateData.rejectionReason = null;
        } else if (status === 'REJECTED') {
            updateData.isVerified = false;
            updateData.rejectionReason = rejectionReason || 'Rejected by admin';
        } else {
            // For other statuses like INTERVIEW_SCHEDULED, just update the status string
            updateData.isVerified = false;
        }

        await prisma.vendorProfile.update({
            where: { id },
            data: updateData
        });

        // Send email notifications
        const { sendKYCEmail } = require('../../../Backend/src/lib/email');
        const vendorUser = await prisma.user.findUnique({
            where: { id: profile.userId },
            select: { email: true, name: true }
        });

        if (vendorUser?.email) {
            if (status === 'APPROVED') {
                // Send "Payment Required" email
                await sendKYCEmail(vendorUser.email, 'kycApproved', vendorUser.name, 5000);
            } else if (status === 'REJECTED') {
                await sendKYCEmail(vendorUser.email, 'kycRejected', vendorUser.name, rejectionReason || 'Please contact support');
            } else if (status === 'INTERVIEW_SCHEDULED' && interviewScheduled) {
                await sendKYCEmail(vendorUser.email, 'interviewScheduled', vendorUser.name, interviewScheduled);
            }
        }

        res.json({
            success: true,
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

// Process Payment (Mock)
router.post('/admin/:id/payment', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // In a real app, this would trigger a payment gateway or verify a transaction
        // For now, we'll just acknowledge it. 
        // If the frontend expects this to approve the vendor, we can do that too.

        // Let's assume processing payment moves it to APPROVED if it was in a valid state
        const profile = await prisma.vendorProfile.findUnique({
            where: { id }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'KYC submission not found'
            });
        }

        // Payment processed -> Verify the vendor
        await prisma.vendorProfile.update({
            where: { id },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedBy: req.user.id,
                verificationStatus: 'APPROVED' // Ensure status is APPROVED
            }
        });

        // Send "Verification Complete" email
        const { sendKYCEmail } = require('../../../Backend/src/lib/email');
        const vendorUser = await prisma.user.findUnique({
            where: { id: profile.userId },
            select: { email: true, name: true }
        });

        if (vendorUser?.email) {
            await sendKYCEmail(vendorUser.email, 'verificationComplete', vendorUser.name);
        }

        res.json({
            success: true,
            message: 'Payment processed and vendor verified successfully'
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
