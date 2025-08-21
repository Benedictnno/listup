const prisma = require('../lib/prisma');

exports.me = async (req, res, next) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        // vendor-specific fields
        storeName: true,
        storeAddress: true,
        businessCategory: true,
        coverImage: true
      }
    });

    if (!me) return res.status(404).json({ message: "User not found" });

    res.json(me);
  } catch (e) {
    next(e);
  }
};
