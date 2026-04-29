const router = require('express').Router();
const { generalLimiter } = require('../middleware/rateLimiter');
const { firebaseGoogleAuth } = require('../controllers/firebase-google.controller');

/**
 * POST /auth/firebase-google
 * Accepts a Firebase ID token from the frontend, verifies it,
 * upserts the user, and issues an HttpOnly JWT cookie.
 */
router.post('/firebase-google', generalLimiter, firebaseGoogleAuth);

module.exports = router;
