require('dotenv').config();
const GeminiService = require('./src/services/geminiService');

async function test() {
    try {
        console.log("Testing GeminiService...");
        const response = await GeminiService.generateResponse("Test User", "12345", "How are you?", []);
        console.log("Response:", response);
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

test();
