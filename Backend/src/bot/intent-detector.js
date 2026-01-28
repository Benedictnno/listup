/**
 * Intent Detector and Entity Extractor
 */

const categories = [
    'shoes', 'clothes', 'fashion', 'electronics', 'phones', 'laptops',
    'home', 'appliances', 'beauty', 'accessories', 'bags', 'watches'
];

const colors = [
    'black', 'white', 'red', 'blue', 'green', 'yellow', 'brown', 'pink', 'purple', 'grey', 'gray'
];

const sizes = [
    'small', 'medium', 'large', 'xl', 'xxl', '38', '39', '40', '41', '42', '43', '44', '45'
];

/**
 * Extract entities from a query string
 * @param {string} text 
 */
function extractEntities(text) {
    const query = text.toLowerCase();
    const entities = {
        category: null,
        brand: null,
        color: null,
        size: null,
        priceRange: { min: null, max: null },
        searchTerm: text // original text for fuzzy fallback
    };

    // Category extraction
    categories.forEach(cat => {
        if (query.includes(cat)) entities.category = cat;
    });

    // Color extraction
    colors.forEach(color => {
        // Use word boundaries for colors like "red" so it doesn't match "ready"
        const reg = new RegExp(`\\b${color}\\b`, 'i');
        if (reg.test(query)) entities.color = color;
    });

    // Size extraction
    sizes.forEach(size => {
        const reg = new RegExp(`\\b${size}\\b`, 'i');
        if (reg.test(query)) entities.size = size;
    });

    // Price extraction: "under 50000", "below 10k", "above 5000"
    const maxPriceMatch = query.match(/(?:under|below|less than|max)\s*(\d+(?:k|000)?)/i);
    if (maxPriceMatch) {
        let val = maxPriceMatch[1].toLowerCase();
        if (val.includes('k')) val = parseInt(val) * 1000;
        entities.priceRange.max = parseInt(val);
    }

    const minPriceMatch = query.match(/(?:above|over|more than|min)\s*(\d+(?:k|000)?)/i);
    if (minPriceMatch) {
        let val = minPriceMatch[1].toLowerCase();
        if (val.includes('k')) val = parseInt(val) * 1000;
        entities.priceRange.min = parseInt(val);
    }

    // Brand extraction - tricky without a massive list, 
    // but we can look for "nike", "adidas", "iphone", "samsung" etc.
    const commonBrands = ['nike', 'adidas', 'iphone', 'samsung', 'apple', 'hp', 'dell', 'gucci', 'zara'];
    commonBrands.forEach(brand => {
        if (query.includes(brand)) entities.brand = brand;
    });

    return entities;
}

/**
 * Detect main intent
 */
function detectIntent(text) {
    const query = text.trim().toLowerCase();

    // Exact command matches or starts with (including Poll button returns)
    if (query === 'help' || query === 'menu' || query === 'info' || query.includes('return info')) {
        if (query.includes('return info')) return 'support_returns';
        return 'help';
    }

    if (query === 'products' || query === 'browse' || query === 'browse_products' || query === 'all products' || query.includes('latest products')) return 'browse_products';
    if (query === 'categories' || query === 'category' || query === 'list_categories' || query.includes('all categories') || query.includes('what categories')) return 'list_categories';
    if (query.includes('return') || query.includes('refund')) return 'support_returns';
    if (query === 'hi' || query === 'hello' || query === 'hey' || query === 'start') return 'greeting';

    // Action verbs for search
    if (query.startsWith('search ') || query.includes('show me') || query.includes('i need') || query.includes('i want')) return 'product_search';

    // Fallback: If it's a short 1-2 word message that includes a category, treat as search
    const entities = extractEntities(text);
    if (entities.category || entities.brand) return 'product_search';

    return 'unknown';
}

module.exports = {
    extractEntities,
    detectIntent
};
