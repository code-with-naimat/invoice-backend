const ApiKey = require('../models/ApiKey');
const User = require('../models/User');

// Authenticate a request using an API key instead of JWT
// Client must send: x-api-key: <raw_api_key>

async function apiKeyAuth(req, res, next) {
    
        const rawKey = req.headers['x-api-key'];

        if (!rawKey) {
            return res.status(401).json({ message: 'Missing x-api-key header' });
        }
       try {
        const keyHash = ApiKey.hashKey(rawKey);
        const apiKey = await ApiKey.findOne({ keyHash, active: true });

        if (!apiKey) {
            return res.status(401).json({ message: 'Invalid or revoked API key' });
        }

        req.user = await User.findById(apiKey.owner).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'API key owner no longer exists' });
        }
        apiKey.lastUsedAt = new Date();
        await apiKey.save();
       next();
    } catch (err) {
        return res.status(401).json({ message: 'API key authentication failed' });
    }
}

module.exports = apiKeyAuth;
