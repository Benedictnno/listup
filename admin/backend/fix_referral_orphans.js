const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for orphaned ReferralUse records (missing vendor)...');
    const referrals = await prisma.referralUse.findMany();
    console.log(`Found ${referrals.length} referral usage records.`);

    let orphans = 0;
    const orphansList = [];

    for (const r of referrals) {
        const vendor = await prisma.user.findUnique({ where: { id: r.vendorId } });
        if (!vendor) {
            console.log(`Orphan found! ReferralUse ID: ${r.id}, Vendor ID: ${r.vendorId}`);
            orphans++;
            orphansList.push(r.id);
        }
    }

    console.log(`Total orphans found: ${orphans}`);

    if (orphans > 0) {
        console.log('Deleting orphans...');
        const result = await prisma.referralUse.deleteMany({
            where: {
                id: { in: orphansList }
            }
        });
        console.log(`Deleted ${result.count} orphaned records.`);
    } else {
        console.log('No orphans to delete.');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
