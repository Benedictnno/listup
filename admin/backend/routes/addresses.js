const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, isAdmin } = require('../middleware/auth');

const prisma = new PrismaClient();

// Get all addresses
router.get('/', async (req, res) => {
  try {
    const addresses = await prisma.address.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Failed to fetch addresses', error: error.message });
  }
});

// Add a new address (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'Address name is required' });
    }

    // Check if address already exists
    const existingAddress = await prisma.address.findUnique({
      where: { name: name.trim() }
    });

    if (existingAddress) {
      return res.status(400).json({ message: 'Address already exists' });
    }

    const newAddress = await prisma.address.create({
      data: {
        name: name.trim(),
        active: true,
        createdBy: req.user.id
      }
    });

    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error creating address:', error);
    res.status(500).json({ message: 'Failed to create address', error: error.message });
  }
});

// Update an address (admin only)
router.patch('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    // Validate input
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ message: 'Address name cannot be empty' });
    }

    // Check if address exists
    const address = await prisma.address.findUnique({
      where: { id }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check if name already exists (if changing name)
    if (name && name !== address.name) {
      const existingAddress = await prisma.address.findUnique({
        where: { name: name.trim() }
      });

      if (existingAddress) {
        return res.status(400).json({ message: 'Address name already exists' });
      }
    }

    // Update address
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(active !== undefined && { active })
      }
    });

    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Failed to update address', error: error.message });
  }
});

// Delete an address (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if address exists
    const address = await prisma.address.findUnique({
      where: { id },
      include: {
        vendors: true
      }
    });

    if (!address) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // Check if address is being used by any vendors
    if (address.vendors.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete address that is being used by vendors',
        vendorCount: address.vendors.length
      });
    }

    // Delete address
    await prisma.address.delete({
      where: { id }
    });

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Failed to delete address', error: error.message });
  }
});

module.exports = router;