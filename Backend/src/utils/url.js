/**
 * Utility to get the frontend URL with proper environment-aware fallbacks.
 * This prevents users from being redirected to localhost on a live server.
 */
function getFrontendUrl() {
    const isProduction = process.env.NODE_ENV === 'production';
    const frontendUrl = process.env.FRONTEND_URL;

    // If we're in production and have a FRONTEND_URL that isn't localhost, use it
    if (isProduction && frontendUrl && !frontendUrl.includes('localhost')) {
        return frontendUrl;
    }

    // If we're in production but FRONTEND_URL is missing or incorrectly set to localhost,
    // use the hardcoded production domain.
    if (isProduction) {
        return 'https://listup.ng';
    }

    // In development/test, prefer FRONTEND_URL if set, otherwise default to localhost:3000
    return frontendUrl || 'http://localhost:3000';
}

module.exports = {
    getFrontendUrl
};
