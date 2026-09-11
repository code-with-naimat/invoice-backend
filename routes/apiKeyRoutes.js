const express = require('express');
const { createApiKey, listApiKeys, revokeApiKey } = require('../controllers/apiKeyController');
const protect = require('../middleware/auth');

const router = express.Router();

// Managing your own API keys always requires a normal logged-in session (JWT)
router.use(protect);

router.route('/').get(listApiKeys).post(createApiKey);
router.route('/:id').delete(revokeApiKey);

module.exports = router;