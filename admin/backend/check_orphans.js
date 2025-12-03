const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking for orphaned VendorProfiles...');
    const profiles = await prisma.vendorProfile.findMany();
    console.log(`Found ${profiles.length} profiles.`);

    let orphans = 0;
    for (const p of profiles) {
        const user = await prisma.user.findUnique({ where: { id: p.userId } });
        if (!user) {
            console.log(`Orphan found! Profile ID: ${p.id}, User ID: ${p.userId}`);
            orphans++;
        }
    }

    console.log(`Total orphans: ${orphans}`);
    if (orphans > 0) {
        console.log('Run with --fix to delete them.');
        if (process.argv.includes('--fix')) {
            console.log('Deleting orphans...');
            for (const p of profiles) {
                const user = await prisma.user.findUnique({ where: { id: p.userId } });
                if (!user) {
                    await prisma.vendorProfile.delete({ where: { id: p.id } });
                    console.log(`Deleted profile ${p.id}`);
                }
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
