try {
    const whatsappService = require('./src/services/whatsappService');
    console.log('✅ whatsappService loaded');
    const geminiService = require('./src/services/geminiService');
    console.log('✅ geminiService loaded');
    process.exit(0);
} catch (err) {
    console.error('❌ Loading failed:', err);
    process.exit(1);
}
