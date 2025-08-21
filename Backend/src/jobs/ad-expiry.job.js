// src/jobs/ad-expiry.job.js
const cron = require("node-cron");
const prisma = require("../lib/prisma");

cron.schedule("0 * * * *", async () => {
  console.log("⏳ Checking for expired ads...");

  const now = new Date();
  await prisma.ad.updateMany({
    where: {
      status: "ACTIVE",
      endDate: { lt: now },
    },
    data: { status: "EXPIRED" },
  });
});
console.log("✅ Expired ads marked successfully");