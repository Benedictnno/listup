const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanOrphanReferrals() {
    try {
        console.log('🔍 Checking for orphan referrals...');

        // Find referrals where the user does not exist
        const allReferrals = await prisma.referral.findMany({
            select: { id: true, userId: true }
        });

        console.log(`Found ${allReferrals.length} total referrals. Verifying users...`);

        let deletedCount = 0;

        for (const ref of allReferrals) {
            const user = await prisma.user.findUnique({
                where: { id: ref.userId }
            });

            if (!user) {
                console.warn(`❌ Referral ${ref.id} has missing user ${ref.userId}. Deleting...`);
                // Use deleteMany to avoid error if it's already gone or has issues
                await prisma.referral.deleteMany({
                    where: { id: ref.id }
                });
                deletedCount++;
            }
        }

        console.log(`✅ Cleanup complete. Deleted ${deletedCount} orphan referrals.`);

    } catch (error) {
        console.error('Error cleaning orphans:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanOrphanReferrals();
