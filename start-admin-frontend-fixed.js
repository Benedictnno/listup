#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting Admin Frontend (Fixed Configuration)...\n');

const adminFrontendDir = path.join(__dirname, 'admin/frontend');

// Copy env.local to .env.local if it doesn't exist
const envLocalPath = path.join(adminFrontendDir, '.env.local');
const envLocalTemplatePath = path.join(adminFrontendDir, 'env.local');

if (fs.existsSync(envLocalTemplatePath) && !fs.existsSync(envLocalPath)) {
  fs.copyFileSync(envLocalTemplatePath, envLocalPath);
  console.log('✅ Created .env.local from template');
}

// Start the admin frontend without Turbopack to avoid webpack conflicts
console.log('📱 Starting admin frontend (using webpack instead of Turbopack)...');
const frontend = spawn('npm', ['run', 'dev:webpack'], {
  cwd: adminFrontendDir,
  stdio: 'inherit',
  shell: true
});

frontend.on('close', (code) => {
  console.log(`\n📱 Admin frontend exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down admin frontend...');
  frontend.kill('SIGINT');
  process.exit(0);
});

console.log('🎉 Admin frontend should be starting at http://localhost:3001');
console.log('📝 Using webpack instead of Turbopack to avoid configuration conflicts');
console.log('🔐 Login with: benedictnnaoma0@gmail.com / Chigozie0@');

