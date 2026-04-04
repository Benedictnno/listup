const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOrphanReferrals() {
    try {
        console.log('🔍 Checking for orphan referrals...');

        // 1. Get all user IDs currently in the Referral table
        const allReferrals = await prisma.referral.findMany({
            select: { userId: true }
        });
        const referralUserIds = [...new Set(allReferrals.map(r => r.userId))];

        console.log(`Checking ${referralUserIds.length} unique user IDs across ${allReferrals.length} referrals...`);

        // 2. Find which of those users actually exist
        const existingUsers = await prisma.user.findMany({
            where: { id: { in: referralUserIds } },
            select: { id: true }
        });
        const existingUserIds = new Set(existingUsers.map(u => u.id));

        // 3. Identify orphan user IDs
        const orphanUserIds = referralUserIds.filter(id => !existingUserIds.has(id));

        if (orphanUserIds.length === 0) {
            console.log('✅ No orphan referrals found.');
            return;
        }

        console.warn(`❌ Found ${orphanUserIds.length} orphan user IDs. Deleting associated referrals...`);

        // 4. Delete all referrals for those orphan user IDs
        const result = await prisma.referral.deleteMany({
            where: { userId: { in: orphanUserIds } }
        });

        console.log(`✅ Cleanup complete. Deleted ${result.count} orphan referrals.`);

    } catch (error) {
        console.error('Error cleaning orphans:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanOrphanReferrals();
