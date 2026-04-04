const prisma = require("../lib/prisma");

exports.getAll = async (req, res, next) => {
  try {
    const tiers = await prisma.listingTier.findMany({
      where: { isActive: true },
      orderBy: { slots: "asc" }
    });
    res.json(tiers);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const tier = await prisma.listingTier.findUnique({
      where: { id: req.params.id }
    });
    if (!tier) return res.status(404).json({ message: "Tier not found" });
    res.json(tier);
  } catch (error) {
    next(error);
  }
};
