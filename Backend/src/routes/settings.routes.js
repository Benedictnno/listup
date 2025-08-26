const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all settings routes
router.use(auth);

// Temporary placeholder route to test if the issue is with the controller
router.get('/', (req, res) => {
  res.json({ message: 'Settings route working' });
});

module.exports = router;
