const prisma = require('./src/lib/prisma');

// Run before each test file
beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    // Delete data from primary collections to ensure a clean state
    // Add any other collections you frequently query in tests
    const collections = [
      prisma.user.deleteMany(),
      prisma.listing.deleteMany(),
      prisma.ad.deleteMany(),
      prisma.conversation.deleteMany(),
      prisma.message.deleteMany(),
      prisma.vendorProfile.deleteMany(),
    ];
    await prisma.$transaction(collections);
  }
});

// Run after all tests finish
afterAll(async () => {
  await prisma.$disconnect();
});
