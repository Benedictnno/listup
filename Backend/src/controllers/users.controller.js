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
        // Profile fields
        profileImage: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
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

// Get user profile with all settings
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: {
          include: {
            businessHours: true,
            socialMedia: true,
            storeSettings: true
          }
        },
        userPreferences: true,
        notificationSettings: true
      }
    });

    if (!userProfile) {
      return res.status(404).json({ message: "User profile not found" });
    }

    res.json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      profileImage,
      bio,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      country
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Name is required"
      });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        profileImage,
        bio,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        state,
        zipCode,
        country
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        bio: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        country: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    next(error);
  }
};
