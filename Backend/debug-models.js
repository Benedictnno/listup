require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = [
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-pro",
        "gemini-1.5-pro",
        "gemini-3-flash"
    ];

    for (const modelName of models) {
        try {
            console.log(`Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`✅ Success with ${modelName}:`, result.response.text());
            process.exit(0);
        } catch (error) {
            console.error(`❌ Failed with ${modelName}:`, error.message);
        }
    }
    console.error("All models failed.");
}

testModels();
