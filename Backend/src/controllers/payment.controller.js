
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PaymentCtrl = {
  initPayment: async (req, res) => {
    const { adId } = req.params;
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) return res.status(404).json({ msg: "Ad not found" });

    try {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email: req.user.email,
          amount: ad.amount * 100, // in kobo
          metadata: { adId: ad.id },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data.data); // contains authorization_url
    } catch (err) {
      console.error(err.response?.data || err.message);
      res.status(500).json({ msg: "Payment init failed" });
    }
  },

  handleWebhook: async (req, res) => {
    const event = req.body;

    if (event.event === "charge.success") {
      const { adId } = event.data.metadata;
      await prisma.ad.update({
        where: { id: adId },
        data: {
          paymentStatus: "PAID",
          status: "ACTIVE",
          transactionId: event.data.reference,
        },
      });
    }

    res.sendStatus(200);
  },
};

module.exports = PaymentCtrl;
