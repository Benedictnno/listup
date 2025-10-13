#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing Admin Frontend...\n');

// Test if the admin frontend can start
const adminFrontendDir = path.join(__dirname, 'admin/frontend');

console.log('📁 Checking admin frontend directory...');
const fs = require('fs');

if (!fs.existsSync(adminFrontendDir)) {
  console.log('❌ Admin frontend directory not found');
  process.exit(1);
}

console.log('✅ Admin frontend directory exists');

// Check if package.json exists
const packageJsonPath = path.join(adminFrontendDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ package.json not found in admin frontend');
  process.exit(1);
}

console.log('✅ package.json exists');

// Check if src/store/authStore.ts exists
const authStorePath = path.join(adminFrontendDir, 'src/store/authStore.ts');
if (!fs.existsSync(authStorePath)) {
  console.log('❌ authStore.ts not found');
  process.exit(1);
}

console.log('✅ authStore.ts exists');

// Check if app/page.tsx exists
const pagePath = path.join(adminFrontendDir, 'app/page.tsx');
if (!fs.existsSync(pagePath)) {
  console.log('❌ app/page.tsx not found');
  process.exit(1);
}

console.log('✅ app/page.tsx exists');

console.log('\n🎉 All admin frontend files are in place!');
console.log('📝 Next steps:');
console.log('1. Copy env.local to .env.local in admin/frontend');
console.log('2. Run: cd admin/frontend && npm run dev');
console.log('3. Access admin panel at http://localhost:3001');
