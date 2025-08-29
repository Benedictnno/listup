require('dotenv').config();
const emailService = require('./src/lib/email');

async function testEmailService() {
  console.log('🧪 Testing ListUp Email Service...\n');
  
  try {
    // Test 1: Verify configuration
    console.log('1️⃣ Testing email configuration...');
    const configOk = await emailService.verifyEmailConfig();
    
    if (!configOk) {
      console.log('❌ Email configuration failed');
      return;
    }
    
    console.log('✅ Email configuration verified\n');
    
    // Test 2: Send test email
    console.log('2️⃣ Sending test email...');
    const testOk = await emailService.testEmailService();
    
    if (!testOk) {
      console.log('❌ Test email failed');
      return;
    }
    
    console.log('✅ Test email sent successfully\n');
    
    // Test 3: Test password reset email
    console.log('3️⃣ Testing password reset email...');
    const resetOk = await emailService.sendPasswordResetCode(
      'test@example.com',
      '123456',
      'Test User'
    );
    
    if (!resetOk) {
      console.log('❌ Password reset email failed');
      return;
    }
    
    console.log('✅ Password reset email sent successfully\n');
    
    console.log('🎉 All email tests passed!');
    
    // Show next steps
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log('\n📧 Check your Mailtrap inbox for the test emails:');
      console.log(process.env.MAILTRAP_INBOX_URL || 'https://mailtrap.io');
    } else if (process.env.NODE_ENV === 'production') {
      console.log('\n📧 Check your production email for the test emails');
    } else {
      console.log('\n📧 Check your Gmail for the test emails');
    }
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    // Provide helpful debugging info
    console.log('\n🔍 Debugging Information:');
    
    if (process.env.EMAIL_SERVICE === 'mailtrap') {
      console.log('- Using Mailtrap service');
      console.log('- Host:', process.env.MAILTRAP_HOST || 'smtp.mailtrap.io');
      console.log('- Port:', process.env.MAILTRAP_PORT || '2525');
      console.log('- User:', process.env.MAILTRAP_USER ? '✅ Set' : '❌ Missing');
      console.log('- Pass:', process.env.MAILTRAP_PASS ? '✅ Set' : '❌ Missing');
    } else if (process.env.NODE_ENV === 'production') {
      console.log('- Using production SMTP');
      console.log('- Host:', process.env.SMTP_HOST || 'Not set');
      console.log('- User:', process.env.SMTP_USER ? '✅ Set' : '❌ Missing');
      console.log('- Pass:', process.env.SMTP_PASS ? '✅ Set' : '❌ Missing');
    } else {
      console.log('- Using Gmail SMTP');
      console.log('- User:', process.env.GMAIL_USER ? '✅ Set' : '❌ Missing');
      console.log('- App Password:', process.env.GMAIL_APP_PASSWORD ? '✅ Set' : '❌ Missing');
    }
    
    console.log('\n📚 Check EMAIL_SETUP.md for configuration help');
  }
}

// Run the test
testEmailService();
