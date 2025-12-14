const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');

try {
    let content = fs.readFileSync(envPath, 'utf8');
    if (content.includes('JWT_SECRET=your-super-secret-jwt-key-here')) {
        content = content.replace('JWT_SECRET=your-super-secret-jwt-key-here', 'JWT_SECRET=superlongrandomsecret');
        fs.writeFileSync(envPath, content);
        console.log('Successfully updated JWT_SECRET in .env');
    } else {
        console.log('JWT_SECRET already updated or not found in expected format.');
    }
} catch (e) {
    console.error('Error updating .env:', e);
    process.exit(1);
}
