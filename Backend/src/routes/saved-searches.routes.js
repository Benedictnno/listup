const router = require('express').Router();
const { auth } = require('../middleware/auth');
const prisma = require('../lib/prisma');
const { generalLimiter } = require('../middleware/rateLimiter');

router.get('/',generalLimiter, auth, async (req, res, next) => {
  try {
    const items = await prisma.savedSearch.findMany({ where: { userId: req.user.id }});
    res.json(items);
  } catch (e) { next(e); }
});

router.post('/',generalLimiter, auth, async (req, res, next) => {
  try {
    const { query, label } = req.body; // query is a JSON object of filters
    const item = await prisma.savedSearch.create({
      data: { userId: req.user.id, query: query || {}, label: label || null }
    });
    res.status(201).json(item);
  } catch (e) { next(e); }
});

router.delete('/:id',generalLimiter, auth, async (req, res, next) => {
  try {
    await prisma.savedSearch.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { next(e); }
});

module.exports = router;
// src/routes/saved-searches.routes.js