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
        where: { id: id },
        data: { name, slug }
        });
        res.json(cat);
    } catch (e) { next(e); }
    }

exports.delete = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({ where: { id: id } });
        res.status(204).send();
    } catch (e) { next(e); }
};

// Add method to seed categories
exports.seed = async (req, res, next) => {
  try {
    const defaultCategories = [
      { name: "All Categories", slug: "all-categories" },
      { name: "Food & Snacks", slug: "food-snacks" },
      { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
      { name: "Fashion & Clothing", slug: "fashion-clothing" },
      { name: "Electronics", slug: "electronics" },
      { name: "Computers", slug: "computers" },
      { name: "Mobile Phones", slug: "mobile-phones" },
      { name: "Audio", slug: "audio" },
      { name: "Handmade & Crafts", slug: "handmade-crafts" }
    ];

    const createdCategories = [];
    
    for (const categoryData of defaultCategories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: categoryData.slug }
      });
      
      if (!existingCategory) {
        const category = await prisma.category.create({
          data: categoryData
        });
        createdCategories.push(category);
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`✅ Category "${categoryData.name}" already exists`);
      }
    }
    
    res.json({
      message: `Categories seeded successfully! ${createdCategories.length} new categories created.`,
      created: createdCategories,
      total: await prisma.category.count()
    });
  } catch (e) { next(e); }
};

