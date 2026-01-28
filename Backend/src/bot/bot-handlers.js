const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { detectIntent, extractEntities } = require('./intent-detector');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://listup.ng';

/**
 * Main Message Handler
 */
async function handleWhatsAppMessage(client, message) {
    const text = message.body;
    const from = message.from;
    const intent = detectIntent(text);

    console.log(`[Bot] Message from ${from}: "${text}" | Intent: ${intent}`);

    switch (intent) {
        case 'greeting':
        case 'help':
            await handleHelp(client, from);
            break;
        case 'browse_products':
            await handleBrowseProducts(client, from);
            break;
        case 'list_categories':
            await handleListCategories(client, from);
            break;
        case 'product_search':
            await handleProductSearch(client, from, text);
            break;
        case 'support_returns':
            await handleSupportReturns(client, from);
            break;
        default:
            await handleUnknown(client, from);
            break;
    }
}

/**
 * Lazy load service functions to avoid circular dependency
 */
function getService() {
    return require('../services/whatsapp.service');
}

/**
 * Handle Help / Menu
 */
async function handleHelp(client, to) {
    const title = `👋 Welcome to *Listup Assistant*!\nI'm here to help you find what you need.`;
    const buttons = [
        { id: 'browse_products', text: '📦 Latest Products' },
        { id: 'list_categories', text: '📂 All Categories' },
        { id: 'support_returns', text: '🔄 Return Info' }
    ];

    try {
        await getService().sendButtons(to, title, buttons);
    } catch (err) {
        console.error('[Bot Handlers] Error in handleHelp:', err);
    }
}

/**
 * Browse Products (Latest)
 */
async function handleBrowseProducts(client, to) {
    try {
        const products = await prisma.listing.findMany({
            where: { isActive: true, whatsappEnabled: true },
            take: 3,
            orderBy: { createdAt: 'desc' }
        });

        if (products.length === 0) {
            await getService().sendMessage(to, `Currently, we don't have any active listings. Check out our website for more!\n\n🔗 ${FRONTEND_URL}`);
            return;
        }

        await getService().sendMessage(to, "📦 *Latest Products on Listup*");
        for (const product of products) {
            await sendProductInfo(client, to, product);
        }

        const moreButtons = [
            { id: 'list_categories', text: '📂 Browse Categories' }
        ];
        await getService().sendButtons(to, "Want to see more?", moreButtons);

    } catch (error) {
        console.error('Browse error:', error);
        await getService().sendMessage(to, "Error loading products.");
    }
}

/**
 * List Categories
 */
async function handleListCategories(client, to) {
    try {
        const categories = await prisma.category.findMany({ select: { id: true, name: true } });
        if (categories.length === 0) {
            await getService().sendMessage(to, "No categories found.");
            return;
        }

        const rows = categories.slice(0, 10).map(c => ({
            rowId: `category_${c.id}`,
            title: c.name,
            description: `Browse items in ${c.name}`
        }));

        const sections = [{ title: 'All Categories', rows }];

        await getService().sendListMessage(to, "📂 *Browse by Category*", "Select Category", sections);

    } catch (error) {
        console.error('Category list error:', error);
        await getService().sendMessage(to, "Error loading categories.");
    }
}

/**
 * Helper to send product info
 */
async function sendProductInfo(client, to, product) {
    const price = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(product.price);
    const caption = `*${product.title}*\n💰 ${price}\n📍 ${product.location || 'Nigeria'}\n\n🔗 ${FRONTEND_URL}/listings/${product.id}`;

    try {
        if (product.images && product.images.length > 0) {
            await getService().sendImage(to, product.images[0], caption);
        } else {
            await getService().sendMessage(to, caption);
        }
    } catch (err) {
        console.error('[Bot Handlers] Error in sendProductInfo:', err);
    }
}

/**
 * Handle Product Search
 */
async function handleProductSearch(client, to, text) {
    const entities = extractEntities(text);
    const searchTerms = text.replace(/search/i, '').trim();

    // Log the search
    try {
        await prisma.searchLog.create({
            data: {
                query: text,
                intent: 'product_search',
                entities: entities,
                source: 'whatsapp'
            }
        });
    } catch (e) { console.error('Search logging failed:', e); }

    // Build Prisma query
    const where = {
        isActive: true,
        whatsappEnabled: true,
    };

    if (entities.category) {
        where.OR = [
            { title: { contains: entities.category, mode: 'insensitive' } },
            { description: { contains: entities.category, mode: 'insensitive' } },
            { whatsappSearchTerms: { has: entities.category } },
            { category: { name: { contains: entities.category, mode: 'insensitive' } } }
        ];
    } else if (searchTerms.length > 2) {
        where.OR = [
            { title: { contains: searchTerms, mode: 'insensitive' } },
            { description: { contains: searchTerms, mode: 'insensitive' } }
        ];
    }

    if (entities.brand) {
        where.brand = { contains: entities.brand, mode: 'insensitive' };
    }

    if (entities.priceRange.max) {
        where.price = { ...where.price, lte: entities.priceRange.max };
    }
    if (entities.priceRange.min) {
        where.price = { ...where.price, gte: entities.priceRange.min };
    }

    try {
        const products = await prisma.listing.findMany({
            where,
            take: 3,
            orderBy: { createdAt: 'desc' }
        });

        if (products.length === 0) {
            const searchLink = `${FRONTEND_URL}/listings?search=${encodeURIComponent(searchTerms)}`;
            const title = `😔 I couldn't find exact matches for "${searchTerms}" here.`;
            const buttons = [
                { id: 'list_categories', text: '📂 All Categories' }
            ];

            await getService().sendMessage(to, `${title}\n\nCheck our full inventory here:\n🔗 ${searchLink}`);
            await getService().sendButtons(to, "Would you like to browse by category instead?", buttons);
            return;
        }

        await getService().sendMessage(to, `🛍️ Found ${products.length} products for you!`);

        for (const product of products) {
            await sendProductInfo(client, to, product);
        }

        const moreLink = `${FRONTEND_URL}/listings?search=${encodeURIComponent(searchTerms)}`;
        await getService().sendMessage(to, `✨ *Want to see more results?*\nView all matches on our website:\n🔗 ${moreLink}`);

    } catch (error) {
        console.error('Search error:', error);
        await getService().sendMessage(to, "Sorry, I ran into an error while searching. Please try again later.");
    }
}

/**
 * Handle Returns Info
 */
async function handleSupportReturns(client, to) {
    const msg = `🔄 *Returns & Refunds*

1️⃣ Contact the seller directly through their store page.
2️⃣ Explain your reason for return.
3️⃣ Follow the seller's return policy.

Each seller unique policy. You can find it on their store page. Need help? Send me the product link!`;
    await getService().sendMessage(to, msg);
}

/**
 * Handle Unknown
 */
async function handleUnknown(client, to) {
    await getService().sendMessage(to, "I'm not sure I understood that. 🤔\n\nTry saying 'SEARCH shoes' or 'HELP' to see what I can do!");
}

module.exports = {
    handleWhatsAppMessage
};
