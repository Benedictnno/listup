const router = require('express').Router();
const { auth } = require('../middleware/auth');
const prisma = require('../lib/prisma');

router.get('/', auth, async (req, res, next) => {
  try {
    const items = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        // show a compact listing snapshot
        // @ts-ignore
        listing: { select: { id: true, title: true, price: true, images: true } }
      }
    });
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/:listingId', auth, async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const fav = await prisma.favorite.upsert({
      where: { userId_listingId: { userId: req.user.id, listingId } },
      update: {},
      create: { userId: req.user.id, listingId }
    });
    res.status(201).json(fav);
  } catch (e) { next(e); }
});

router.delete('/:listingId', auth, async (req, res, next) => {
  try {
    const { listingId } = req.params;
    await prisma.favorite.delete({
      where: { userId_listingId: { userId: req.user.id, listingId } }
    });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
