/**
 * Verification script for Gemini history role fix
 */
require('dotenv').config();
const GeminiService = require('./src/services/geminiService');

async function testHistoryFix() {
    console.log('🚀 Starting History Role Verification...');

    // Simulate history starting with a 'model' (outbound) message
    const history = [
        { body: 'I am the bot, I spoke first (which is invalid for Gemini)', direction: 'outbound' },
        { body: 'Hello bot', direction: 'inbound' }
    ];

    const userName = 'Test User';
    const phoneNumber = '1234567890';
    const message = 'Good morning';

    console.log('📤 Sending message with invalid history start...');
    try {
        const response = await GeminiService.generateResponse(userName, phoneNumber, message, history);
        console.log('📥 Gemini Response:', response);
        console.log('✅ Verification Successful: GeminiService handled the history correctly.');
    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

testHistoryFix();
