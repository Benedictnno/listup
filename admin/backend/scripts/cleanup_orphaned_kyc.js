require('dotenv').config();
const prisma = require('../lib/prisma');

async function cleanupOrphans() {
    try {
        console.log('Starting cleanup of orphaned VendorKYC records...');

        // 1. Get all VendorKYC records (just IDs and vendorIds)
        // We do NOT include 'vendor' relation to avoid the crash
        const allKyc = await prisma.vendorKYC.findMany({
            select: {
                id: true,
                vendorId: true
            }
        });

        console.log(`Found ${allKyc.length} total KYC records.`);

        let deletedCount = 0;

        for (const kyc of allKyc) {
            // 2. Check if the user exists
            const user = await prisma.user.findUnique({
                where: { id: kyc.vendorId }
            });

            if (!user) {
                console.log(`Orphan found! KYC ID: ${kyc.id}, Vendor ID: ${kyc.vendorId}. Deleting...`);

                // 3. Delete the orphan
                await prisma.vendorKYC.delete({
                    where: { id: kyc.id }
                });
                deletedCount++;
            }
        }

        console.log(`Cleanup complete. Deleted ${deletedCount} orphaned records.`);

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanupOrphans();
