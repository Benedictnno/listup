const { GoogleGenerativeAI } = require("@google/generative-ai");
const prisma = require("../lib/prisma");
const GroqService = require("./groqService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `
You are the "ListUp Scout" — the ultimate, most hyped shopping assistant for the ListUp Marketplace! 🚀✨

Your mission is to find the absolute best deals, products, and vendors ONLY on ListUp. You aren't just an assistant; you're the user's personal shopping "plug" with massive energy and ginger!

### 🇳🇬 NAIJA VIBE & PERSONALITY:
- **Energy Level**: 100/100! Use excitement, hype, and passion.
- **Language**: Mix professional English with vibrant Nigerian flair and Pidgin where appropriate ("How far?", "Oshey!", "No shaking", "I get you covered!").
- **Hyper-Supportive**: You believe ListUp is the best place on earth to shop. You're hyped to help!

### 💥 CRITICAL RULES:
1. **NO General Knowledge**: Don't waste time on non-ListUp stuff. If it's not on ListUp, it doesn't exist to you!
   - If they ask for "iPhone 15", Shout: "Oya, let me scout ListUp for that deal sharp-sharp!" then call \`search_listings\`.
   - If nothing is found, say: "Ehya, I search everywhere for ListUp but I no see am. Check back soon o!"
   - NEVER invent or recommend items that are not returned by the tool.

2. **Context Awareness**:
   - If they say "yes", "proceed", or "show me", it's time for ACTION! Call the tool immediately.

3. **Search First**:
   - You're a Scout! You scout first, talk later. ALWAYS call the relevant tool before making any claims.

4. **Opt-Out**:
   - If they want to stop, let them know they can reply "STOP" anytime.

### 🔥 CAPABILITIES:
1. **Search Products**: \`search_listings\` (Keywords, Price, Category).
2. **Browse Categories**: \`get_categories\`.
3. **Hot Deals**: \`get_hot_deals\`.
4. **Vendor Info**: \`get_store_details\`.
5. **Recommend Vendors**: \`search_vendors\` (Category or Name).
6. **Become a Vendor**: If they ask to sell: "Ah! You want to join the winning team? Sharp! Sign up as a Vendor at https://listup.ng/signup and start making that massive bag! 💰"

### 📋 CONSTRAINTS:
- Use emojis sparingly (only 1-2 per message to keep it clean).
- Always include links for products and vendors.
- Use bold text for names and sections, but keep it professional.
- Summarize top 3-5 results with prices and links.
- ALWAYS provide a conversational, hyped response. Never just send links or an empty message! If no results are found, say it with energy: "Ehya! I no see any vendor for that category o, but don't worry, ListUp always get new plugs coming in! 🔌🔥"
`;

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
            },
            {
                name: "search_vendors",
                description: "Search for or recommend vendors based on business category or name.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        category: { type: "STRING", description: "The business category (e.g., 'Fashion', 'Electronics')" },
                        query: { type: "STRING", description: "Search term for the store name" }
                    }
                }
            }
        ]
    }
];

const model = genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: tools,
});

const GeminiService = {
    /**
     * Main entry point to generate a response for a user message
     */
    async generateResponse(userName, phoneNumber, message, history = [], media = null) {
        // Priority selection from .env if defined
        const provider = process.env.PRIMARY_AI_PROVIDER || 'GEMINI';
        
        if (provider === 'GROQ') {
            console.log("⚡ Forcing Groq AI as primary provider...");
            try {
                return await GroqService.generateResponse(userName, phoneNumber, message, history);
            } catch (error) {
                console.error("Forced Groq Service Error:", error.message);
            }
        }

        try {
            console.log("🌟 Using Gemini 3 Flash (Preview)...");
            // Sanitize and cap input message
            if (message && typeof message === 'string') {
                message = message.trim().substring(0, 500);
            }

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
                    } else if (name === "search_vendors") {
                        toolResult = await this.tools.search_vendors(args);
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
                const finalResponse = result.response.text();
                return finalResponse || "I found some info but I'm having trouble explaining it! Try asking specifically for the vendor names. 🤖";
            }

            const textResponse = response.text();
            return textResponse || "I'm here and ready to ginger! What are we looking for on ListUp today? 🚀";
        } catch (error) {
            console.error("Gemini Service Error:", error.message);
            console.log("🔄 Failover to Groq AI...");
            try {
                return await GroqService.generateResponse(userName, phoneNumber, message, history);
            } catch (groqError) {
                console.error("Groq Failover Error:", groqError.message);
                return "I'm having a bit of trouble thinking right now. Could you try again in a moment? 🤖";
            }
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
            const since = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h limit

            const [views, saves, clicks] = await Promise.all([
              prisma.listingView.groupBy({
                by: ['listingId'],
                where: { viewedAt: { gte: since } },
                _count: { _all: true }
              }),
              prisma.listingSaveEvent.groupBy({
                by: ['listingId'],
                where: { savedAt: { gte: since } },
                _count: { _all: true }
              }),
              prisma.listingMessageClick.groupBy({
                by: ['listingId'],
                where: { clickedAt: { gte: since } },
                _count: { _all: true }
              }),
            ]);

            const scores = new Map();
            views.forEach(v => scores.set(v.listingId, (scores.get(v.listingId) || 0) + v._count._all));
            saves.forEach(s => scores.set(s.listingId, (scores.get(s.listingId) || 0) + s._count._all * 2));
            clicks.forEach(c => scores.set(c.listingId, (scores.get(c.listingId) || 0) + c._count._all * 3));

            const topIds = [...scores.entries()]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3) // Return top 3 deals
              .map(([id]) => id);

            let topDeals = [];

            if (topIds.length > 0) {
              const fetched = await prisma.listing.findMany({
                where: { id: { in: topIds }, isActive: true },
                select: { id: true, title: true, price: true }
              });
              // Preserve score order
              topDeals = topIds.map(id => fetched.find(l => l && l.id === id)).filter(Boolean);
            }

            // Fallback if no interacting interactions exist for cold start
            if (topDeals.length === 0) {
                topDeals = await prisma.listing.findMany({
                    where: { isActive: true },
                    orderBy: [{ boostScore: 'desc' }, { createdAt: 'desc' }],
                    take: 3,
                    select: { id: true, title: true, price: true }
                });
            }

            return topDeals.map(d => ({
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
        },

        async search_vendors({ category, query }) {
            const filters = {};
            if (category) filters.businessCategory = { contains: category, mode: 'insensitive' };
            if (query) filters.storeName = { contains: query, mode: 'insensitive' };

            const vendors = await prisma.vendorProfile.findMany({
                where: filters,
                take: 5,
                select: {
                    storeName: true,
                    businessCategory: true,
                    storeAddress: true,
                    isVerified: true
                }
            });

            return vendors.map(v => ({
                ...v,
                link: `https://listup.ng/stores/${encodeURIComponent(v.storeName.replace(/\s+/g, '-'))}`
            }));
        }
    }
};

module.exports = GeminiService;
