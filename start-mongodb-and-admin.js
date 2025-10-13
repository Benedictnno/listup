#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Starting MongoDB and Admin Backend...\n');

// Function to check if MongoDB is running
async function checkMongoDB() {
  return new Promise((resolve) => {
    const checkProcess = spawn('netstat', ['-an'], { shell: true });
    let output = '';
    
    checkProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    checkProcess.on('close', () => {
      const isRunning = output.includes('27017') && output.includes('LISTENING');
      resolve(isRunning);
    });
  });
}

// Function to start MongoDB
async function startMongoDB() {
  console.log('📦 Starting MongoDB...');
  
  // Try different MongoDB start commands
  const mongoCommands = [
    'mongod --dbpath C:\\data\\db',
    'mongod',
    'net start MongoDB',
    'sudo systemctl start mongod',
    'brew services start mongodb-community'
  ];
  
  for (const command of mongoCommands) {
    try {
      console.log(`🔄 Trying: ${command}`);
      const mongoProcess = spawn(command, { 
        shell: true, 
        detached: true,
        stdio: 'ignore'
      });
      
      // Wait a bit to see if it starts
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const isRunning = await checkMongoDB();
      if (isRunning) {
        console.log('✅ MongoDB started successfully!');
        return true;
      }
    } catch (error) {
      console.log(`❌ Failed: ${command}`);
    }
  }
  
  console.log('❌ Could not start MongoDB automatically');
  return false;
}

// Main function
async function main() {
  console.log('🔍 Checking MongoDB status...');
  
  const isMongoRunning = await checkMongoDB();
  
  if (!isMongoRunning) {
    console.log('⚠️  MongoDB is not running. Attempting to start...');
    
    const started = await startMongoDB();
    if (!started) {
      console.log('\n❌ MongoDB could not be started automatically.');
      console.log('📝 Please start MongoDB manually:');
      console.log('   1. Open Command Prompt as Administrator');
      console.log('   2. Run: mongod --dbpath C:\\data\\db');
      console.log('   3. Or if installed as service: net start MongoDB');
      console.log('   4. Or start MongoDB Compass if you have it installed');
      console.log('\n🔄 Once MongoDB is running, run this script again.');
      process.exit(1);
    }
  } else {
    console.log('✅ MongoDB is already running!');
  }
  
  // Wait a moment for MongoDB to be fully ready
  console.log('⏳ Waiting for MongoDB to be ready...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Start admin backend
  console.log('\n🚀 Starting Admin Backend...');
  const adminBackendDir = path.join(__dirname, 'admin/backend');
  
  // Check if .env exists in admin backend
  const envPath = path.join(adminBackendDir, '.env');
  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file for admin backend...');
    const envContent = `DATABASE_URL="mongodb://localhost:27017/listup"
ADMIN_PORT=4001
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3001
MAIN_FRONTEND_URL=http://localhost:3000`;
    
    try {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env file created');
    } catch (error) {
      console.log('❌ Could not create .env file:', error.message);
    }
  }
  
  // Start the admin backend
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: adminBackendDir,
    stdio: 'inherit',
    shell: true
  });
  
  backend.on('close', (code) => {
    console.log(`\n📊 Admin backend exited with code ${code}`);
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down admin backend...');
    backend.kill('SIGINT');
    process.exit(0);
  });
  
  console.log('\n🎉 Admin backend should be starting at http://localhost:4001');
  console.log('📝 You can now login to the admin panel at http://localhost:3001');
}

main().catch(console.error);

