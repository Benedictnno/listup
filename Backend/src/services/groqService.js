const { Groq } = require("groq-sdk");
const prisma = require("../lib/prisma");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

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
- ALWAYS provide a conversational, hyped response. Never just send links or an empty message! If no results are found, say it with energy: "Ehya! I search everywhere for ListUp but I no see am. Check back soon o! 🔌🔥"
`;

const tools = [
    {
        type: "function",
        function: {
            name: "search_listings",
            description: "Search for product listings by keyword, price range, or category.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The search keyword (e.g., 'iPhone')" },
                    minPrice: { type: "number", description: "Minimum price in Naira" },
                    maxPrice: { type: "number", description: "Maximum price in Naira" },
                    categoryId: { type: "string", description: "Filter by category ID" }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "get_categories",
            description: "Fetch all product categories available on ListUp.",
        }
    },
    {
        type: "function",
        function: {
            name: "get_hot_deals",
            description: "Fetch featured or boosted product listings.",
        }
    },
    {
        type: "function",
        function: {
            name: "get_store_details",
            description: "Fetch details and listings for a specific store/vendor by name.",
            parameters: {
                type: "object",
                properties: {
                    storeName: { type: "string", description: "The name of the store to lookup" }
                },
                required: ["storeName"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_vendors",
            description: "Search for or recommend vendors based on business category or name.",
            parameters: {
                type: "object",
                properties: {
                    category: { type: "string", description: "The business category (e.g., 'Fashion', 'Electronics')" },
                    query: { type: "string", description: "Search term for the store name" }
                }
            }
        }
    }
];

const GroqService = {
    async generateResponse(userName, phoneNumber, message, history = []) {
        try {
            const messages = [
                { role: "system", content: SYSTEM_INSTRUCTION },
                ...history.map(h => ({
                    role: h.direction === 'inbound' ? 'user' : 'assistant',
                    content: h.body
                })),
                { role: "user", content: message }
            ];

            const response = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                tools: tools,
                tool_choice: "auto",
                temperature: 0.1,
            });

            const choice = response.choices[0];
            const responseMessage = choice.message;

            if (responseMessage.tool_calls) {
                const toolResponses = [];
                messages.push(responseMessage);

                for (const toolCall of responseMessage.tool_calls) {
                    const { name, arguments: argsString } = toolCall.function;
                    const args = JSON.parse(argsString);
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

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({ result: toolResult })
                    });
                }

                const secondResponse = await groq.chat.completions.create({
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                });

                const finalContent = secondResponse.choices[0].message.content;
                return finalContent || "I found some info but I'm having trouble explaining it! Try asking specifically for the vendor names. 🤖";
            }

            const rawContent = responseMessage.content;
            return rawContent || "I'm here and ready to ginger! What are we looking for on ListUp today? 🚀";
        } catch (error) {
            console.error("Groq Service Error:", error);
            throw error;
        }
    },

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
                select: { id: true, title: true, price: true, location: true }
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
            return await prisma.listing.findMany({
                where: { isActive: true },
                orderBy: [{ boostScore: 'desc' }, { createdAt: 'desc' }],
                take: 3,
                select: { id: true, title: true, price: true }
            });
        },

        async get_store_details({ storeName }) {
            const vendor = await prisma.vendorProfile.findFirst({
                where: { storeName: { contains: storeName, mode: 'insensitive' } },
                select: { storeName: true, storeAddress: true, userId: true }
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

module.exports = GroqService;
