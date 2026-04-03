/**
 * cleanup-bot-users.js
 * 
 * Run this script to migrate the automatically generated bot "User" 
 * accounts (wa_... @listup.bot) into the newly created "BotContact" collection.
 * It also moves their associated WhatsAppMessageLog records over.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanUpBotUsers() {
  console.log('Started cleanup of bot users...');
  
  // Find all fake users created by the previous whatsappService logic
  const botUsers = await prisma.user.findMany({
    where: {
      email: {
        endsWith: '@listup.bot'
      },
      email: {
        startsWith: 'wa_'
      }
    }
  });

  if (botUsers.length === 0) {
    console.log('No bot users found to migrate. Cleanup finished.');
    return;
  }

  console.log(`Found ${botUsers.length} bot users to migrate.`);
  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of botUsers) {
    try {
      if (!user.phone) {
        console.warn(`User ${user.id} has no phone number, skipping calculation.`);
        continue;
      }
      
      // See if BotContact already exists for this phone
      const existingContact = await prisma.botContact.findUnique({
        where: { phone: user.phone }
      });
      
      let newContactId;

      if (!existingContact) {
        // Create new BotContact mapping fields
        const newContact = await prisma.botContact.create({
          data: {
            phone: user.phone,
            name: user.name,
            whatsappOptIn: user.whatsappOptIn || true,
            whatsappStopRequested: user.whatsappStopRequested || false,
            whatsappMessageCount: user.whatsappMessageCount || 0,
            whatsappLastMessageDate: user.whatsappLastMessageDate,
            whatsappEngagementScore: user.whatsappEngagementScore || 100,
            lastWhatsappInteraction: user.lastWhatsappInteraction,
            lastContactReminderDate: user.lastContactReminderDate,
            whatsappContactReminderCount: user.whatsappContactReminderCount || 0,
            isContactSavedByBot: user.isContactSavedByBot || false,
            createdAt: user.createdAt,
          }
        });
        newContactId = newContact.id;
      } else {
        newContactId = existingContact.id;
      }

      // Re-assign any WhatsAppMessageLogs
      await prisma.whatsAppMessageLog.updateMany({
        where: { userId: user.id },
        data: {
          botContactId: newContactId,
          userId: null
        }
      });

      console.log(`Migrated logs and contact for phone ${user.phone}`);

      // Delete the fake user
      await prisma.user.delete({
        where: { id: user.id }
      });

      console.log(`Deleted fake bot user ID: ${user.id}`);
      migratedCount++;
    } catch (e) {
      console.error(`Failed to migrate user ${user.id} (${user.phone}):`, e);
      skippedCount++;
    }
  }

  console.log('--- Cleanup Summary ---');
  console.log(`Total Found: ${botUsers.length}`);
  console.log(`Migrated & Cleaned: ${migratedCount}`);
  console.log(`Skipped/Errors: ${skippedCount}`);
}

cleanUpBotUsers()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
