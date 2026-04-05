require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testSingleModel() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = "gemini-3-flash-preview";

    try {
        console.log(`Testing model: ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        console.log(`✅ Success with ${modelName}:`, result.response.text());
        process.exit(0);
    } catch (error) {
        console.error(`❌ Failed with ${modelName}:`, error.message);
        process.exit(1);
    }
}

testSingleModel();
