const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../lib/prisma");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are the "ListUp Scout", a shopping assistant for the ListUp Marketplace.
Your goal is to help users find products, categories, and vendors ONLY on ListUp.

### CRITICAL RULES (Follow these or you will fail):
1. **NO General Knowledge**: Do NOT answer general questions (e.g., "Recommend a book", "What is the capital of France?", "How do I fix my phone?").
   - If a user asks for a product (e.g., "Recommend a book"), you MUST use the \`search_listings\` tool to see if it exists on ListUp.
   - If the search returns nothing, say: "I couldn't find that on ListUp."
   - NEVER invent or recommend items that are not returned by the tool.

2. **Context Awareness**:
   - If the user says "proceed", "yes", "go ahead", or "show me", look at the *previous message* in the history.
   - If you previously offered to search for something, DO IT NOW. Call the relevant tool.

3. **Search First Policy**:
   - You cannot know what is in the store without checking.
   - ALWAYS call \`search_listings\` before making any claims about product availability.

4. **Opt-Out Requests**:
   - If a user expresses a desire to stop receiving messages or unsubscribe (e.g., "STOP", "Unsubscribe", "Don't message me anymore"), acknowledge it politely and inform them that they can reply with "STOP" to be removed from the list.
   - Note: The system handles the literal "STOP" command automatically.

### Personality:
- Friendly, efficient, Nigerian flair ("How far?", "Welcome o!").
- Professional but lively.

### Capabilities:
1. ** Search Products **: \`search_listings\` (Keywords, Price, Category).
2. **Browse Categories**: \`get_categories\`.
3. **Hot Deals**: \`get_hot_deals\`.
4. **Vendor Info**: \`get_store_details\`.

### Constraints:
- Only discuss marketplace related topics.
- When presenting products, summarize the top 3-5 results with their prices and a link to view more.
- Always provide the link to the product or store if available.
`;

// Tool definitions for Gemini
const tools = [
    {
        functionDeclarations: [
            {
                name: "search_listings",
                description: "Search for product listings in the database by keyword, price range, or category.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: { type: "STRING", description: "The search keyword (e.g., 'iPhone', 'Chair')" },
                        minPrice: { type: "NUMBER", description: "Minimum price in Naira" },
                        maxPrice: { type: "NUMBER", description: "Maximum price in Naira" },
                        categoryId: { type: "STRING", description: "Filter by category ID" }
                    },
                    required: ["query"]
                }
            },
            {
                name: "get_categories",
                description: "Fetch all product categories available on ListUp.",
            },
            {
                name: "get_hot_deals",
                description: "Fetch featured or boosted product listings.",
            },
            {
                name: "get_store_details",
                description: "Fetch details and listings for a specific store/vendor by name.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        storeName: { type: "STRING", description: "The name of the store or vendor to lookup" }
                    },
                    required: ["storeName"]
                }
            }
        ]
    }
];

const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: tools,
});

const GeminiService = {
    /**
     * Main entry point to generate a response for a user message
     */
    async generateResponse(userName, phoneNumber, message, history = [], media = null) {
        try {
            // Map existing history to Gemini format { role: "user" | "model", parts: [{ text: "..." }] }
            let formattedHistory = history.map(h => ({
                role: h.direction === 'inbound' ? 'user' : 'model',
                parts: [{ text: h.body }]
            }));

            // Gemini requires the first message in context to be from the 'user'
            const firstUserIndex = formattedHistory.findIndex(h => h.role === 'user');
            if (firstUserIndex > 0) {
                formattedHistory = formattedHistory.slice(firstUserIndex);
            } else if (firstUserIndex === -1) {
                formattedHistory = [];
            }

            const chat = model.startChat({
                history: formattedHistory,
            });

            const messageParts = [];
            if (message) messageParts.push({ text: message });
            if (media) {
                messageParts.push({
                    inlineData: {
                        data: media.buffer.toString('base64'),
                        mimeType: media.mimetype
                    }
                });
            }

            let result = await chat.sendMessage(messageParts);
            let response = result.response;

            // Handle tool calls if any
            const call = response.functionCalls();
            if (call) {
                const toolResponses = [];

                for (const functionCall of call) {
                    const { name, args } = functionCall;
                    let toolResult;

                    if (name === "search_listings") {
                        toolResult = await this.tools.search_listings(args);
                    } else if (name === "get_categories") {
                        toolResult = await this.tools.get_categories();
                    } else if (name === "get_hot_deals") {
                        toolResult = await this.tools.get_hot_deals();
                    } else if (name === "get_store_details") {
                        toolResult = await this.tools.get_store_details(args);
                    }

                    toolResponses.push({
                        functionResponse: {
                            name,
                            response: { result: toolResult }
                        }
                    });
                }

                // Send tool results back to the model to get final text
                result = await chat.sendMessage(toolResponses);
                return result.response.text();
            }

            return response.text();
        } catch (error) {
            console.error("Gemini Service Error:", error);
            return "I'm having a bit of trouble thinking right now. Could you try again in a moment? 🤖";
        }
    },

    // Implementation of the tools that talk to Prisma
    tools: {
        async search_listings({ query, minPrice, maxPrice, categoryId }) {
            const filters = { isActive: true };
            if (query) filters.title = { contains: query, mode: 'insensitive' };
            if (categoryId) filters.categoryId = categoryId;
            if (minPrice || maxPrice) {
                filters.price = {};
                if (minPrice) filters.price.gte = minPrice;
                if (maxPrice) filters.price.lte = maxPrice;
            }

            const items = await prisma.listing.findMany({
                where: filters,
                take: 5,
                select: {
                    id: true,
                    title: true,
                    price: true,
                    location: true,
                }
            });

            return items.map(i => ({
                ...i,
                link: `https://listup.ng/listings/${i.id}`
            }));
        },

        async get_categories() {
            return await prisma.category.findMany({
                select: { id: true, name: true }
            });
        },

        async get_hot_deals() {
            const deals = await prisma.listing.findMany({
                where: { isActive: true, boostScore: { gt: 0 } },
                orderBy: { boostScore: 'desc' },
                take: 3,
                select: { id: true, title: true, price: true }
            });

            return deals.map(d => ({
                ...d,
                link: `https://listup.ng/listings/${d.id}`
            }));
        },

        async get_store_details({ storeName }) {
            const vendor = await prisma.vendorProfile.findFirst({
                where: { storeName: { contains: storeName, mode: 'insensitive' } },
                select: {
                    storeName: true,
                    storeAddress: true,
                    businessCategory: true,
                    userId: true
                }
            });

            if (!vendor) return { error: "Store not found" };

            const recentListings = await prisma.listing.findMany({
                where: { sellerId: vendor.userId, isActive: true },
                take: 3,
                select: { id: true, title: true, price: true }
            });

            return {
                ...vendor,
                listings: recentListings.map(l => ({ ...l, link: `https://listup.ng/listings/${l.id}` }))
            };
        }
    }
};

module.exports = GeminiService;
