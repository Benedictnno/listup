/**
 * Utility to get the frontend URL with proper environment-aware fallbacks.
 * This prevents users from being redirected to localhost on a live server.
 */
function getFrontendUrl() {
    // If FRONTEND_URL is explicitly set in .env, use it
    if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL;
    }

    // Otherwise, default based on the environment
    if (process.env.NODE_ENV === 'production') {
        return 'https://listup.ng';
    }

    // Default for development
    return 'http://localhost:3000';
}

module.exports = {
    getFrontendUrl
};
