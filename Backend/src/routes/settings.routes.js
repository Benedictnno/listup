const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const SettingsCtrl = require('../controllers/settings.controller');

// Apply authentication middleware to all settings routes
router.use(auth);

// Get all settings for the authenticated user
router.get('/', SettingsCtrl.getUserSettings);

// Store settings (vendor store profile, hours, social links)
router.put('/store', SettingsCtrl.updateStoreSettings);

// Personal information (name, phone, profile, address info)
router.put('/personal', SettingsCtrl.updatePersonalInfo);

// Security: change password
router.put('/password', SettingsCtrl.updatePassword);

// Notification settings
router.put('/notifications', SettingsCtrl.updateNotificationSettings);

// User preferences (language, timezone, currency, theme, etc.)
router.put('/preferences', SettingsCtrl.updateUserPreferences);

// Store-level preferences
router.put('/store-preferences', SettingsCtrl.updateStorePreferences);

// Profile image upload
router.put('/profile-image', SettingsCtrl.uploadProfileImage);

// Store logo / cover image upload
router.put('/store-image', SettingsCtrl.uploadStoreImage);

module.exports = router;
