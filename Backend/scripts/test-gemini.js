const axios = require('axios');
require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        console.log("Response from Gemini API:");
        const models = response.data.models;
        if (models) {
            models.forEach(m => {
                console.log(`- ${m.name} [Methods: ${m.supportedGenerationMethods.join(', ')}]`);
            });
        } else {
            console.log("No models found. Response body:", response.data);
        }
    } catch (err) {
        console.error("Error fetching models:", err.response?.data || err.message);
    }
}

listModels();
