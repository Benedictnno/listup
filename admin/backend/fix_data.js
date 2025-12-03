const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Fixing null updatedAt...');
    try {
        // MongoDB raw command to update updatedAt where it is null
        // Note: Collection name might be 'VendorProfile' or 'vendorProfile' depending on mapping. 
        // Prisma usually maps model VendorProfile to collection VendorProfile.
        const res = await prisma.$runCommandRaw({
            update: "VendorProfile",
            updates: [
                {
                    q: { updatedAt: null },
                    u: { $set: { updatedAt: { $date: new Date().toISOString() } } },
                    multi: true
                }
            ]
        });
        console.log('Fixed updatedAt:', res);
    } catch (e) {
        console.error('Error fixing updatedAt:', e);
    }

    console.log('Checking for orphans again...');
    // Now we should be able to query
    const profiles = await prisma.vendorProfile.findMany();
    console.log(`Found ${profiles.length} profiles.`);

    let orphans = 0;
    for (const p of profiles) {
        if (!p.userId) {
            console.log(`Profile ${p.id} has null userId`);
            orphans++;
            await prisma.vendorProfile.delete({ where: { id: p.id } });
            console.log('Deleted.');
            continue;
        }
        const user = await prisma.user.findUnique({ where: { id: p.userId } });
        if (!user) {
            console.log(`Orphan found! Profile ID: ${p.id}, User ID: ${p.userId}`);
            orphans++;
            await prisma.vendorProfile.delete({ where: { id: p.id } });
            console.log('Deleted.');
        }
    }
    console.log(`Total orphans deleted: ${orphans}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
