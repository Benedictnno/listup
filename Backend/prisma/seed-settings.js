const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSettings() {
  try {
    console.log('🌱 Seeding settings data...');

    // Get existing users with VENDOR role
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: { id: true }
    });

    if (vendors.length === 0) {
      console.log('No vendors found. Skipping settings seed.');
      return;
    }

    for (const vendor of vendors) {
      // Create or update vendor profile with enhanced settings
      const vendorProfile = await prisma.vendorProfile.upsert({
        where: { userId: vendor.id },
        update: {},
        create: {
          userId: vendor.id,
          storeName: 'Sample Store',
          storeDescription: 'A sample store for demonstration purposes',
          businessCategory: 'Electronics',
          storeAddress: '123 Sample Street',
          website: 'www.samplestore.com'
        }
      });

      // Create business hours
      await prisma.businessHours.upsert({
        where: { vendorProfileId: vendorProfile.id },
        update: {},
        create: {
          vendorProfileId: vendorProfile.id,
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '10:00', close: '16:00', closed: false },
          sunday: { open: '12:00', close: '16:00', closed: true }
        }
      });

      // Create social media
      await prisma.socialMedia.upsert({
        where: { vendorProfileId: vendorProfile.id },
        update: {},
        create: {
          vendorProfileId: vendorProfile.id,
          facebook: 'samplestore',
          twitter: '@samplestore',
          instagram: 'samplestore_ng'
        }
      });

      // Create store settings
      await prisma.storeSettings.upsert({
        where: { vendorProfileId: vendorProfile.id },
        update: {},
        create: {
          vendorProfileId: vendorProfile.id,
          autoSave: true,
          emailDigest: true
        }
      });

      // Create user preferences
      await prisma.userPreferences.upsert({
        where: { userId: vendor.id },
        update: {},
        create: {
          userId: vendor.id,
          language: 'English',
          timezone: 'Africa/Lagos',
          currency: 'NGN',
          dateFormat: 'DD/MM/YYYY',
          theme: 'light'
        }
      });

      // Create notification settings
      await prisma.notificationSettings.upsert({
        where: { userId: vendor.id },
        update: {},
        create: {
          userId: vendor.id,
          orderUpdates: true,
          newMessages: true,
          lowStockAlerts: true,
          paymentNotifications: true,
          marketingEmails: false,
          weeklyReports: true,
          monthlyReports: true,
          emailNotifications: true,
          smsNotifications: false
        }
      });

      console.log(`✅ Settings created for vendor: ${vendor.id}`);
    }

    console.log('🎉 Settings seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding settings:', error);
    throw error;
  }
}

// Run the seed function
seedSettings()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
