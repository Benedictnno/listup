const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'] // add 'query' for debugging if needed
});

module.exports = prisma;
// src/lib/prisma.js    