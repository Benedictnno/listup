const axios = require("axios");
const prisma = require("../lib/prisma");

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

// Initialize payment
exports.initPayment = async (req, res, next) => {
  try {
    const { adId, amount, email } = req.body;

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // Create reference
    const reference = `ad_${adId}_${Date.now()}`;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      { email, amount: amount * 100, reference },
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    // Save payment
    await prisma.payment.create({
      data: { reference, amount, adId, status: "PENDING" },
    });

    res.json(response.data);
  } catch (e) {
    next(e);
  }
};

// Webhook
exports.paystackWebhook = async (req, res, next) => {
  try {
    const event = req.body;

   if (event.event === "charge.success") {
  const { reference } = event.data;

  const payment = await prisma.payment.update({
    where: { reference },
    data: { status: "SUCCESS" },
    include: { ad: true },
  });

  const ad = payment.ad;

  await prisma.ad.update({
    where: { id: ad.id },
    data: { status: "ACTIVE" },
  });

  // If it's a search boost, bump boostScore
  if (ad.type === "SEARCH_BOOST" && ad.listingId) {
    await prisma.listing.update({
      where: { id: ad.listingId },
      data: { boostScore: { increment: 100 } }, // arbitrary weight
    });
  }
}


    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
