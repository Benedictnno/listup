const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

// Get all settings for a user
exports.getUserSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get user with all related settings
    const user = await prisma.user.findUnique({
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
        NotificationSettings: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    next(error);
  }
};

// Update store settings
exports.updateStoreSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      storeName,
      storeDescription,
      businessCategory,
      storeAddress,
      website,
      businessHours,
      socialMedia,
      storeAnnouncement
    } = req.body;

    // Validate required fields
    if (!storeName || !businessCategory || !storeAddress) {
      return res.status(400).json({
        success: false,
        message: "Store name, business category, and address are required"
      });
    }

    // Get or create vendor profile
    let vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId }
    });

    if (!vendorProfile) {
      vendorProfile = await prisma.vendorProfile.create({
        data: {
          userId,
          storeName,
          storeDescription,
          businessCategory,
          storeAddress,
          website,
          storeAnnouncement
        }
      });
    } else {
      // Update existing vendor profile
      vendorProfile = await prisma.vendorProfile.update({
        where: { id: vendorProfile.id },
        data: {
          storeName,
          storeDescription,
          businessCategory,
          storeAddress,
          website,
          storeAnnouncement
        }
      });
    }

    // Update or create business hours and natural media in parallel
    const updates = [];

    if (businessHours) {
      updates.push(
        prisma.businessHours.upsert({
          where: { vendorProfileId: vendorProfile.id },
          update: businessHours,
          create: {
            ...businessHours,
            vendorProfileId: vendorProfile.id
          }
        })
      );
    }

    if (socialMedia) {
      updates.push(
        prisma.socialMedia.upsert({
          where: { vendorProfileId: vendorProfile.id },
          update: socialMedia,
          create: {
            ...socialMedia,
            vendorProfileId: vendorProfile.id
          }
        })
      );
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    // Get updated data
    const updatedProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfile.id },
      include: {
        businessHours: true,
        socialMedia: true,
        storeSettings: true
      }
    });

    res.json({
      success: true,
      message: "Store settings updated successfully",
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    next(error);
  }
};

// Update personal information
exports.updatePersonalInfo = async (req, res, next) => {
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
      message: "Personal information updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating personal information:', error);
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Get current user to verify current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('Error updating password:', error);
    next(error);
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      orderUpdates,
      newMessages,
      lowStockAlerts,
      paymentNotifications,
      marketingEmails,
      weeklyReports,
      monthlyReports,
      emailNotifications,
      smsNotifications
    } = req.body;

    // Update or create notification settings
    const notificationSettings = await prisma.notificationSettings.upsert({
      where: { userId },
      update: {
        orderUpdates,
        newMessages,
        lowStockAlerts,
        paymentNotifications,
        marketingEmails,
        weeklyReports,
        monthlyReports,
        emailNotifications,
        smsNotifications
      },
      create: {
        userId,
        orderUpdates: orderUpdates ?? true,
        newMessages: newMessages ?? true,
        lowStockAlerts: lowStockAlerts ?? true,
        paymentNotifications: paymentNotifications ?? true,
        marketingEmails: marketingEmails ?? false,
        weeklyReports: weeklyReports ?? true,
        monthlyReports: monthlyReports ?? true,
        emailNotifications: emailNotifications ?? true,
        smsNotifications: smsNotifications ?? false
      }
    });

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      data: notificationSettings
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    next(error);
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      language,
      timezone,
      currency,
      dateFormat,
      theme
    } = req.body;

    // Update or create user preferences
    const userPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        language,
        timezone,
        currency,
        dateFormat,
        theme
      },
      create: {
        userId,
        language: language ?? "English",
        timezone: timezone ?? "Africa/Lagos",
        currency: currency ?? "NGN",
        dateFormat: dateFormat ?? "DD/MM/YYYY",
        theme: theme ?? "light"
      }
    });

    res.json({
      success: true,
      message: "User preferences updated successfully",
      data: userPreferences
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    next(error);
  }
};

// Update store preferences (auto-save, email digest, etc.)
exports.updateStorePreferences = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { autoSave, emailDigest } = req.body;

    // Get vendor profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found"
      });
    }

    // Update or create store settings
    const storeSettings = await prisma.storeSettings.upsert({
      where: { vendorProfileId: vendorProfile.id },
      update: {
        autoSave: autoSave ?? true,
        emailDigest: emailDigest ?? true
      },
      create: {
        vendorProfileId: vendorProfile.id,
        autoSave: autoSave ?? true,
        emailDigest: emailDigest ?? true
      }
    });

    res.json({
      success: true,
      message: "Store preferences updated successfully",
      data: storeSettings
    });
  } catch (error) {
    console.error('Error updating store preferences:', error);
    next(error);
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // This would typically handle file upload to cloud storage
    // For now, we'll assume the image URL is passed in the request
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required"
      });
    }

    // Update user profile image
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
      select: {
        id: true,
        name: true,
        profileImage: true
      }
    });

    res.json({
      success: true,
      message: "Profile image updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Error uploading profile image:', error);
    next(error);
  }
};

// Upload store logo/cover image
exports.uploadStoreImage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { imageUrl, imageType } = req.body; // 'logo' or 'cover'

    if (!imageUrl || !imageType) {
      return res.status(400).json({
        success: false,
        message: "Image URL and type are required"
      });
    }

    if (!['logo', 'cover'].includes(imageType)) {
      return res.status(400).json({
        success: false,
        message: "Image type must be 'logo' or 'cover'"
      });
    }

    // Get or create vendor profile
    let vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId }
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found. Please create store settings first."
      });
    }

    // Update the appropriate image field
    const updateData = imageType === 'logo' ? { logo: imageUrl } : { coverImage: imageUrl };

    const updatedProfile = await prisma.vendorProfile.update({
      where: { id: vendorProfile.id },
      data: updateData
    });

    res.json({
      success: true,
      message: `${imageType} image updated successfully`,
      data: updatedProfile
    });
  } catch (error) {
    console.error('Error uploading store image:', error);
    next(error);
  }
};
