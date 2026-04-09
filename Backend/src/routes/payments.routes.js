// routes/payments.routes.js
const express = require("express");
const axios = require("axios");
const prisma = require("../lib/prisma");
const { auth, allow } = require("../middleware/auth");
const { checkFeature } = require("../middleware/featureFlag");
const KYCCtrl = require("../controllers/kyc.controller");
const crypto = require("crypto");
const { getFrontendUrl } = require("../utils/url");

const router = express.Router();

// ─── Listing Package Helpers ────────────────────────────────────────────────

/**
 * Get the effective listing package price & slot count for a vendor.
 * Admin can set custom overrides per-vendor on VendorProfile;
 * otherwise the global SystemSettings values are used.
 */
async function getListingPackageConfig(vendorId) {
  const [settings, profile] = await Promise.all([
    prisma.systemSettings.findFirst(),
    prisma.vendorProfile.findUnique({
      where: { userId: vendorId },
      select: { customListingPackagePrice: true, customListingPackageCount: true },
    }),
  ]);

  const globalPrice = settings?.listingPackagePrice ?? 1000;
  const globalCount = settings?.listingPackageCount ?? 3;

  return {
    price: profile?.customListingPackagePrice ?? globalPrice,
    count: profile?.customListingPackageCount ?? globalCount,
  };
}

/**
 * Internal: credit a vendor with extra listing slots after successful payment.
 * Idempotent — uses paystackRef to ensure a charge is only processed once.
 * Safe — never increments if the vendor already has unlimited access (listingLimit = -1).
 * @returns {{ alreadyProcessed: boolean }}
 */
async function _processListingPackagePaymentInternal(vendorId, slotsToAdd, paystackRef, amountPaid) {
  // 1. Idempotency: check if this Paystack reference was already processed
  const existing = await prisma.listingPackagePurchase.findUnique({
    where: { paystackRef },
  });

  if (existing) {
    console.log(`ℹ️ Listing package payment ${paystackRef} already processed — skipping`);
    return { alreadyProcessed: true };
  }

  // 2. Guard: don't touch unlimited vendors (listingLimit = -1 or KYC-verified)
  const user = await prisma.user.findUnique({
    where: { id: vendorId },
    select: { listingLimit: true, isKYCVerified: true },
  });

  if (!user) throw new Error(`Vendor ${vendorId} not found`);

  if (user.isKYCVerified) {
    console.log(`ℹ️ Vendor ${vendorId} is KYC verified — recording purchase and incrementing limit`);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: vendorId },
        data: { listingLimit: { increment: slotsToAdd } },
      }),
      prisma.listingPackagePurchase.create({
        data: { vendorId, paystackRef, slotsAdded: slotsToAdd, amountPaid: amountPaid ?? 0 },
      }),
    ]);
    return { alreadyProcessed: false };
  }

  // 3. Credit slots and record purchase atomically
  await prisma.$transaction([
    prisma.user.update({
      where: { id: vendorId },
      data: { listingLimit: { increment: slotsToAdd } },
    }),
    prisma.listingPackagePurchase.create({
      data: { vendorId, paystackRef, slotsAdded: slotsToAdd, amountPaid: amountPaid ?? 0 },
    }),
  ]);

  return { alreadyProcessed: false };
}


// Initialize payment for an ad
router.post("/initialize", auth, checkFeature('listing_promotion'), async (req, res) => {
  const { adId, email, amount } = req.body;

  if (!adId || !email || !amount) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Verify the ad exists and belongs to the user
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { vendor: true }
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    if (ad.vendorId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects kobo
        metadata: { adId },
        callback_url: `${getFrontendUrl()}/dashboard/promote/payments/${adId}/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    res.json({ authorizationUrl: response.data.data.authorization_url });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// Initialize KYC payment
router.post("/kyc/initialize", auth, allow('VENDOR'), checkFeature('kyc_system'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    const kyc = await prisma.vendorKYC.findUnique({
      where: { vendorId },
    });

    if (!kyc) {
      return res.status(400).json({ error: "KYC record not found for this vendor" });
    }

    if (kyc.paymentStatus === "SUCCESS") {
      return res.status(400).json({ error: "KYC payment has already been completed" });
    }

    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: "Vendor email not found" });
    }

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(kyc.signupFee * 100), // Paystack expects kobo
        metadata: {
          kycId: kyc.id,
          vendorId: vendorId,
          hasReferral: kyc.hasReferral,
        },
        callback_url: `${getFrontendUrl()}/kyc/payment/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.json({ authorizationUrl: response.data.data.authorization_url });
  } catch (error) {
    console.error("KYC payment initialization failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "KYC payment initialization failed" });
  }
});

// Initialize yearly KYC renewal payment (always full fee, no referral discount)
router.post("/kyc/renew/initialize", auth, allow('VENDOR'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    const kyc = await prisma.vendorKYC.findUnique({
      where: { vendorId },
    });

    if (!kyc) {
      return res.status(400).json({ error: "KYC record not found for this vendor" });
    }

    if (kyc.paymentStatus !== "SUCCESS") {
      return res.status(400).json({ error: "Initial KYC payment must be completed before renewal" });
    }

    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { email: true },
    });

    if (!user || !user.email) {
      return res.status(400).json({ error: "Vendor email not found" });
    }

    const yearlyFee = 5000; // Full yearly renewal fee (NGN)

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(yearlyFee * 100), // Paystack expects kobo
        metadata: {
          kycId: kyc.id,
          vendorId: vendorId,
          kycRenewal: true,
        },
        callback_url: `${getFrontendUrl()}/kyc/payment/success`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.json({ authorizationUrl: response.data.data.authorization_url });
  } catch (error) {
    console.error("KYC renewal payment initialization failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "KYC renewal payment initialization failed" });
  }
});

// Get payment status for an ad
router.get("/ad/:adId/status", auth, async (req, res) => {
  try {
    const { adId } = req.params;
    
    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        vendorId: true,
        status: true,
        paymentStatus: true,
        transactionId: true,
        type: true,
        amount: true,
      },
    });

    if (!ad) {
      return res.status(404).json({ error: "Ad not found" });
    }

    // Check if user can access this ad
    if (ad.vendorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(ad);
  } catch (error) {
    console.error("Error fetching ad payment status:", error);
    res.status(500).json({ error: "Failed to fetch payment status" });
  }
});

// ─── Listing Package: How much does it cost? (vendor can preview) ───────────
router.get("/listing-package/config", auth, allow('VENDOR'), async (req, res) => {
  try {
    const config = await getListingPackageConfig(req.user.id);
    res.json({
      success: true,
      data: {
        price: config.price,
        listingSlots: config.count,
        description: `Purchase ${config.count} listing slots for ₦${config.price.toLocaleString()}`,
      },
    });
  } catch (error) {
    console.error("Error fetching listing package config:", error);
    res.status(500).json({ error: "Failed to fetch listing package config" });
  }
});

// ─── Listing Package: Initialize Paystack payment ───────────────────────────
router.post("/listing-package/initialize", auth, allow('VENDOR'), async (req, res) => {
  try {
    const vendorId = req.user.id;

    // KYC-verified vendors don't need to buy packages
    const user = await prisma.user.findUnique({
      where: { id: vendorId },
      select: { email: true, isKYCVerified: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isKYCVerified) {
      return res.status(400).json({
        error: "KYC-verified vendors have unlimited listings and do not need to purchase packages",
      });
    }

    const config = await getListingPackageConfig(vendorId);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(config.price * 100), // Paystack expects kobo
        metadata: {
          type: "listing_package",
          vendorId,
          listingSlotsToAdd: config.count,
        },
        callback_url: `${getFrontendUrl()}/dashboard/buy-listings/success`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    return res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
      packageDetails: {
        price: config.price,
        listingSlots: config.count,
      },
    });
  } catch (error) {
    console.error("Listing package payment init failed:", error.response?.data || error.message);
    return res.status(500).json({ error: "Listing package payment initialization failed" });
  }
});

// Webhook for payment provider
router.post("/webhook", async (req, res) => {
  if (!req.rawBody) {
    console.error("⚠️ No raw body found on webhook request");
    return res.sendStatus(400);
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.error("⚠️ Invalid Paystack signature - possible fraud attempt");
    return res.sendStatus(401);
  }

  // Raw body is already parsed by express.json() with verify into req.body
  // Just use req.body directly to avoid double parsing and potential inconsistencies
  console.log("=== WEBHOOK RECEIVED (VERIFIED) ===");
  console.log("Event:", req.body.event);
  console.log("Data:", JSON.stringify(req.body.data, null, 2));

  const event = req.body;

  if (event.event === "charge.success") {
    const metadata = event.data.metadata || {};
    const { adId, kycId, kycRenewal, type, vendorId, listingSlotsToAdd } = metadata;

    // ── Handle Listing Package payments ──────────────────────────────────────
    if (type === "listing_package" && vendorId) {
      try {
        let slots = 0;
        const paystackRef = event.data.reference;
        const amountPaid = (event.data.amount || 0) / 100; // convert from kobo to naira

        // 1. Check if we have a specific tierId from the new top-up flow
        if (metadata.tierId) {
          const tier = await prisma.listingTier.findUnique({
            where: { id: metadata.tierId }
          });
          if (tier) {
            slots = tier.slots;
            console.log(`📦 Found ListingTier: ${tier.name} (${slots} slots) for tierId: ${metadata.tierId}`);
          }
        }

        // 2. Fallback to legacy global/custom config if no tier found
        if (!slots) {
          const config = await getListingPackageConfig(vendorId);
          slots = config.count;
          console.log(`📦 Using legacy config: ${slots} slots for vendor: ${vendorId}`);
        }

        if (slots > 0) {
          console.log(`🔄 Crediting ${slots} listing slots to vendor: ${vendorId} (ref: ${paystackRef})`);
          const result = await _processListingPackagePaymentInternal(vendorId, slots, paystackRef, amountPaid);
          if (result.alreadyProcessed) {
            console.log(`ℹ️ Duplicate webhook for ref ${paystackRef} — already processed, ignoring`);
          } else {
            console.log(`✅ Listing package payment processed for vendor: ${vendorId} (+${slots} slots)`);
          }
        } else {
          console.error(`❌ Could not determine slot count for vendor ${vendorId} (tierId: ${metadata.tierId})`);
        }
      } catch (error) {
        console.error(`❌ Error processing listing package payment for vendor ${vendorId}:`, error);
      }
    }

    // ── Handle KYC payments ───────────────────────────────────────────────────
    if (kycId) {
      try {
        if (kycRenewal) {
          console.log(`🔄 Processing successful KYC renewal payment for kycId: ${kycId}`);
          await KYCCtrl._processKYCRenewalPaymentInternal(kycId);
          console.log(`✅ KYC renewal payment processed for kycId: ${kycId}`);
        } else {
          console.log(`🔄 Processing successful initial KYC payment for kycId: ${kycId}`);
          await KYCCtrl._processKYCPaymentInternal(kycId);
          console.log(`✅ Initial KYC payment processed for kycId: ${kycId}`);
        }
      } catch (error) {
        console.error(`❌ Error processing KYC payment for kycId ${kycId}:`, error);
      }
    }

    // Handle Ad payments (existing behavior)
    if (adId) {
      try {
        console.log(`🔄 Processing successful payment for ad: ${adId}`);
        
        // Get the ad to check current status
        const ad = await prisma.ad.findUnique({
          where: { id: adId },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            amount: true,
            type: true,
          },
        });

        if (!ad) {
          console.error(`❌ Ad ${adId} not found`);
          // Do not return non-200 to avoid webhook retries
        } else if (ad.paymentStatus !== "SUCCESS") {
          // Set proper dates for the ad
          const now = new Date();
          const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

          const updatedAd = await prisma.ad.update({
            where: { 
              id: adId,
              paymentStatus: { not: "SUCCESS" } // Atomic idempotency check
            },
            data: {
              status: "ACTIVE",
              paymentStatus: "SUCCESS",
              transactionId: event.data.reference,
              startDate: now,
              endDate: endDate,
            },
          });

          console.log(`✅ Ad ${adId} payment successful and updated`);
          console.log(`📅 Start Date: ${now.toISOString()}`);
          console.log(`📅 End Date: ${endDate.toISOString()}`);
          console.log(`💰 Amount: ₦${ad.amount}`);
          console.log(`🎯 Type: ${ad.type}`);
          console.log(`🔗 Transaction ID: ${event.data.reference}`);

          // Log the complete updated ad data
          console.log("📊 Updated ad data:", JSON.stringify(updatedAd, null, 2));
        } else {
          console.log(`ℹ️ Ad ${adId} already marked as paid`);
        }

      } catch (error) {
        console.error(`❌ Error updating ad ${adId}:`, error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          stack: error.stack,
        });
        
        // Don't fail the webhook - return 200 to acknowledge receipt
      }
    }
  } else {
    console.log(`ℹ️ Unhandled webhook event: ${event.event}`);
  }

  console.log("=== WEBHOOK PROCESSING COMPLETE ===");
  res.sendStatus(200);
});

// Manual payment verification (for testing/debugging) - ADMIN ONLY
router.post("/verify-payment/:adId", auth, allow('ADMIN'), async (req, res) => {
  try {
    const { adId } = req.params;
    console.log(`🔍 Manual payment verification for ad: ${adId}`);

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        amount: true,
        type: true,
      },
    });

    if (!ad) {
      console.log(`❌ Ad ${adId} not found`);
      return res.status(404).json({ message: "Ad not found" });
    }

    if (ad.paymentStatus === "SUCCESS") {
      console.log(`ℹ️ Ad ${adId} already verified as paid`);
      return res.json({ 
        message: "Ad already verified as paid",
        ad: ad 
      });
    }

    // Simulate successful payment
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        status: "ACTIVE",
        paymentStatus: "SUCCESS",
        transactionId: `MANUAL_VERIFY_${Date.now()}`,
        startDate: now,
        endDate: endDate,
      },
    });

    console.log(`✅ Ad ${adId} manually verified and updated`);
    console.log(`📅 Start Date: ${now.toISOString()}`);
    console.log(`📅 End Date: ${endDate.toISOString()}`);
    console.log(`💰 Amount: ₦${ad.amount}`);
    console.log(`🎯 Type: ${ad.type}`);

    res.json({
      message: "Payment manually verified successfully",
      ad: updatedAd,
    });

  } catch (error) {
    console.error(`❌ Error manually verifying payment for ad ${req.params.adId}:`, error);
    res.status(500).json({ 
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;