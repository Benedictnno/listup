const express = require('express');
const router = express.Router();
const axios = require('axios');
const prisma = require('../lib/prisma');
const { auth } = require('../middleware/auth');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize payment
router.post('/initialize', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get vendor profile
        const vendor = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                vendorProfile: true,
                usedReferralCode: true
            }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return res.status(403).json({
                success: false,
                message: 'Only vendors can make KYC payments'
            });
        }

        if (!vendor.vendorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        // Check if already verified
        if (vendor.vendorProfile.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Your account is already verified'
            });
        }

        // Check if KYC is approved
        if (vendor.vendorProfile.verificationStatus !== 'APPROVED') {
            return res.status(400).json({
                success: false,
                message: 'Your KYC must be approved before payment'
            });
        }

        // Calculate amount (₦5000 or ₦3000 with referral)
        const hasReferral = vendor.usedReferralCode !== null;
        const amount = hasReferral ? 300000 : 500000; // Amount in kobo (₦3000 or ₦5000)

        // Initialize Paystack payment
        const paystackResponse = await axios.post(
            'https://api.paystack.co/transaction/initialize',
            {
                email: vendor.email,
                amount: amount,
                currency: 'NGN',
                metadata: {
                    userId: vendor.id,
                    vendorProfileId: vendor.vendorProfile.id,
                    purpose: 'KYC_VERIFICATION',
                    hasReferral: hasReferral
                },
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/kyc-payment?verify=true`
            },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!paystackResponse.data.status) {
            throw new Error('Failed to initialize payment');
        }

        res.json({
            success: true,
            data: {
                authorizationUrl: paystackResponse.data.data.authorization_url,
                accessCode: paystackResponse.data.data.access_code,
                reference: paystackResponse.data.data.reference,
                amount: amount / 100 // Convert back to Naira
            }
        });

    } catch (error) {
        console.error('Payment initialization error:', error);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to initialize payment'
        });
    }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
    try {
        const { reference } = req.body;
        const userId = req.user.id;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: 'Payment reference is required'
            });
        }

        // Verify payment with Paystack
        const paystackResponse = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                }
            }
        );

        const paymentData = paystackResponse.data.data;

        if (!paystackResponse.data.status || paymentData.status !== 'success') {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Verify the payment belongs to this user
        if (paymentData.metadata.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Payment does not belong to this user'
            });
        }

        // Get vendor profile
        const vendor = await prisma.user.findUnique({
            where: { id: userId },
            include: { vendorProfile: true }
        });

        if (!vendor || !vendor.vendorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        // Check if already verified (prevent double verification)
        if (vendor.vendorProfile.isVerified) {
            return res.json({
                success: true,
                message: 'Account already verified',
                alreadyVerified: true
            });
        }

        // Update vendor profile to verified
        await prisma.vendorProfile.update({
            where: { id: vendor.vendorProfile.id },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
                verificationStatus: 'APPROVED'
            }
        });

        // Send verification complete email
        try {
            const { sendKYCEmail } = require('../lib/email');
            await sendKYCEmail(vendor.email, 'verificationComplete', vendor.name);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the request if email fails
        }

        // If vendor used a referral code, mark referral as completed
        if (paymentData.metadata.hasReferral) {
            try {
                const referralUse = await prisma.referralUse.findFirst({
                    where: { vendorId: userId },
                    include: { referral: { include: { user: true } } }
                });

                if (referralUse && referralUse.status === 'PENDING') {
                    await prisma.$transaction(async (tx) => {
                        // Update referral use status
                        await tx.referralUse.update({
                            where: { id: referralUse.id },
                            data: { status: 'COMPLETED' }
                        });

                        // Update referral totals
                        await tx.referral.update({
                            where: { id: referralUse.referralId },
                            data: {
                                successfulReferrals: { increment: 1 },
                                totalEarnings: { increment: referralUse.commission }
                            }
                        });
                    });

                    // Send referral reward email
                    try {
                        const { sendKYCEmail } = require('../lib/email');
                        await sendKYCEmail(
                            referralUse.referral.user.email,
                            'referralReward',
                            referralUse.referral.user.name,
                            vendor.name,
                            referralUse.commission
                        );
                    } catch (e) {
                        console.error('Failed to send referral reward email:', e);
                    }
                }
            } catch (referralError) {
                console.error('Failed to process referral:', referralError);
                // Don't fail the request if referral processing fails
            }
        }

        res.json({
            success: true,
            message: 'Payment verified and account activated successfully',
            data: {
                verified: true,
                amount: paymentData.amount / 100,
                paidAt: paymentData.paid_at
            }
        });

    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to verify payment'
        });
    }
});

// Get payment status
router.get('/status', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const vendor = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                vendorProfile: true,
                usedReferralCode: true
            }
        });

        if (!vendor || vendor.role !== 'VENDOR') {
            return res.status(403).json({
                success: false,
                message: 'Only vendors can check payment status'
            });
        }

        if (!vendor.vendorProfile) {
            return res.status(404).json({
                success: false,
                message: 'Vendor profile not found'
            });
        }

        const hasReferral = vendor.usedReferralCode !== null;
        const amount = hasReferral ? 3000 : 5000;
        const isVerified = vendor.vendorProfile.isVerified || false;
        const verificationStatus = vendor.vendorProfile.verificationStatus || 'PENDING';
        const canPay = verificationStatus === 'APPROVED' && !isVerified;

        console.log('Payment status check:', {
            userId,
            isVerified,
            verificationStatus,
            canPay
        });

        res.json({
            success: true,
            data: {
                isVerified,
                verificationStatus,
                amount,
                hasReferral,
                canPay
            }
        });

    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status'
        });
    }
});

module.exports = router;
