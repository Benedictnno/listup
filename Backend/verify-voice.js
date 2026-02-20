/**
 * Verification script for WhatsApp Voice Message handling in GeminiService
 */
require('dotenv').config();
const GeminiService = require('./src/services/geminiService');

async function testVoiceHandling() {
    console.log('🚀 Starting Voice Message Verification...');

    // Mock audio data (just a small buffer)
    const mockAudioData = {
        buffer: Buffer.from('GIZMO_AUDIO_STUB'), // This is just a stub, real audio would be better but we're testing the interface
        mimetype: 'audio/ogg; codecs=opus'
    };

    const userName = 'Test User';
    const phoneNumber = '1234567890';
    const message = 'I sent you a voice message';
    const history = [];

    console.log('📤 Sending mock audio message to GeminiService...');
    try {
        const response = await GeminiService.generateResponse(userName, phoneNumber, message, history, mockAudioData);
        console.log('📥 Gemini Response:', response);
        console.log('✅ Verification Successful: GeminiService handled the media parameter.');
    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
}

testVoiceHandling();
