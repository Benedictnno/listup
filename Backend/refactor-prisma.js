const fs = require('fs');

const files = [
  'src/routes/advertisements.routes.js',
  'src/services/whatsapp-notification.service.js',
  'src/jobs/whatsapp-reminders.job.js',
  'src/jobs/chat-notification.job.js',
  'src/jobs/chat-cleanup.job.js',
  'src/bot/bot-handlers.js'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the import of PrismaClient
    content = content.replace(/const\s*\{\s*PrismaClient\s*\}\s*=\s*require\('@prisma\/client'\);\r?\n?/g, '');
    
    // Replace the instantiation
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);/g, "const prisma = require('../lib/prisma');");
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Refactored ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
