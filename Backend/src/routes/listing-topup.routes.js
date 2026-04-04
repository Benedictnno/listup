const router = require("express").Router();
const prisma = require("../lib/prisma");
const { auth } = require("../middleware/auth");
const axios = require("axios");

// Initialize a listing top-up payment
router.post("/initialize", auth, async (req, res, next) => {
  try {
    const { tierId } = req.body;
    const vendorId = req.user.id;

    if (!tierId) return res.status(400).json({ message: "Tier ID is required" });

    const [tier, user] = await Promise.all([
      prisma.listingTier.findUnique({ where: { id: tierId } }),
      prisma.user.findUnique({ where: { id: vendorId }, select: { email: true } })
    ]);

    if (!tier) return res.status(404).json({ message: "Selected tier not found" });
    if (!user || !user.email) return res.status(400).json({ message: "User email not found" });

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: Math.round(tier.price * 100), // kobo
        metadata: {
          type: "listing_package",
          vendorId,
          tierId: tier.id,
          listingSlotsToAdd: tier.slots,
        },
        callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/buy-listings/success`,
      },
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      }
    );

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error("Listing top-up init failed:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to initialize top-up payment" });
  }
});

module.exports = router;
