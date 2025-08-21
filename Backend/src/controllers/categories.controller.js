const { validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

exports.list = async (req, res, next) => {
  try {
    const out = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    res.json(out);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, slug } = req.body;
    const cat = await prisma.category.create({ data: { name, slug } });
    res.status(201).json(cat);
  } catch (e) { next(e); }
};
exports.update = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
        const { id } = req.params;
        const { name, slug } = req.body;
    
        const cat = await prisma.category.update({
        where: { id: parseInt(id) },
        data: { name, slug }
        });
        res.json(cat);
    } catch (e) { next(e); }
    }
exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id: parseInt(id) } });
        res.status(204).send();
    } catch (e) { next(e); }
};

