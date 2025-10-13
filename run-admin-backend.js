#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ListUp Admin Backend...\n');

// Copy the Prisma schema from main backend to admin backend
const fs = require('fs');
const mainSchemaPath = path.join(__dirname, 'Backend/prisma/schema.prisma');
const adminSchemaPath = path.join(__dirname, 'admin/backend/prisma/schema.prisma');

// Create prisma directory in admin backend if it doesn't exist
const adminPrismaDir = path.dirname(adminSchemaPath);
if (!fs.existsSync(adminPrismaDir)) {
  fs.mkdirSync(adminPrismaDir, { recursive: true });
}

// Copy schema file
if (fs.existsSync(mainSchemaPath)) {
  fs.copyFileSync(mainSchemaPath, adminSchemaPath);
  console.log('✅ Copied Prisma schema to admin backend');
} else {
  console.log('❌ Main Prisma schema not found');
  process.exit(1);
}

// Set working directory to admin backend
const adminBackendDir = path.join(__dirname, 'admin/backend');

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
const prismaGenerate = spawn('npx', ['prisma', 'generate'], {
  cwd: adminBackendDir,
  stdio: 'inherit',
  shell: true
});

prismaGenerate.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Prisma client generated successfully\n');
    
    // Start the admin backend server
    console.log('🚀 Starting admin backend server...');
    const server = spawn('npm', ['run', 'dev'], {
      cwd: adminBackendDir,
      stdio: 'inherit',
      shell: true
    });

    server.on('close', (code) => {
      console.log(`\n📊 Admin backend server exited with code ${code}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down admin backend...');
      server.kill('SIGINT');
      process.exit(0);
    });

  } else {
    console.log('❌ Failed to generate Prisma client');
    process.exit(1);
  }
});
