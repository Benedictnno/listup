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

        const [profiles, total] = await Promise.all([
            prisma.vendorProfile.findMany({
                where,
                skip,
                take,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    socialMedia: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.vendorProfile.count({ where })
        ]);

        // Map VendorProfile to KYCSubmission interface expected by frontend
        const kycs = profiles.map(profile => {
            // Determine payment status based on verification
            let paymentStatus = 'PENDING';
            if (profile.verificationStatus === 'APPROVED') {
                paymentStatus = 'SUCCESS';
            }

            return {
                id: profile.id,
                vendorId: profile.userId,
                status: profile.verificationStatus || 'PENDING',
                paymentStatus: paymentStatus,
                signupFee: 5000, // Hardcoded for now as per requirement
                hasReferral: false, // Placeholder
                tiktokHandle: null, // Placeholder as not in SocialMedia model yet
                instagramHandle: profile.socialMedia?.instagram || null,
                facebookPage: profile.socialMedia?.facebook || null,
                twitterHandle: profile.socialMedia?.twitter || null,
                otherSocial: profile.socialMedia?.linkedin || null,
                createdAt: profile.createdAt,
                updatedAt: profile.updatedAt,
                interviewScheduled: null, // Not persisted in current schema
                interviewCompleted: null, // Not persisted in current schema
                interviewNotes: null,
                rejectionReason: profile.rejectionReason,
                vendor: {
                    id: profile.user.id,
                    name: profile.user.name,
                    email: profile.user.email,
                    phone: profile.user.phone,
                    vendorProfile: {
                        storeName: profile.storeName,
                        storeAddress: profile.addressId ? 'Address linked' : null // Simplified
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
            updateData.isVerified = true;
            updateData.verifiedAt = new Date();
            updateData.verifiedBy = req.user.id;
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
                await sendKYCEmail(vendorUser.email, 'verificationComplete', vendorUser.name);
            } else if (status === 'REJECTED') {
                await sendKYCEmail(vendorUser.email, 'kycRejected', vendorUser.name, rejectionReason || 'Please contact support');
            } else if (status === 'INTERVIEW_SCHEDULED' && interviewScheduled) {
                await sendKYCEmail(vendorUser.email, 'interviewScheduled', vendorUser.name, interviewScheduled);
            } else if (status === 'INTERVIEW_COMPLETED') {
                await sendKYCEmail(vendorUser.email, 'kycApproved', vendorUser.name, 5000);
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

        // Just return success for now, maybe update status if needed
        // But usually payment is separate from verification status in the model
        // Since we don't have a Payment model linked to KYC, we'll just return success

        res.json({
            success: true,
            message: 'Payment processed successfully'
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
