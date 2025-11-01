const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const {auth, isAuthenticated} = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

// Create new category (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if category with same name or slug already exists
    const existingByName = await prisma.category.findUnique({
      where: { name }
    });
    
    const existingBySlug = await prisma.category.findUnique({
      where: { slug: categorySlug }
    });

    if (existingByName || existingBySlug) {
      return res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: categorySlug
      }
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// Update category (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Check if another category with same name or slug already exists
    const existingByName = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: req.params.id } },
          { name }
        ]
      }
    });
    
    const existingBySlug = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: req.params.id } },
          { slug: categorySlug }
        ]
      }
    });

    if (existingByName || existingBySlug) {
      return res.status(400).json({ success: false, message: 'Category with this name or slug already exists' });
    }

    const updatedCategory = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name,
        slug: categorySlug
      }
    });
    
    res.json({ success: true, data: updatedCategory });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// Delete category (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id }
    });
    
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id: req.params.id }
    });
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
});

module.exports = router;