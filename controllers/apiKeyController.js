const ApiKey = require('../models/ApiKey');

// POST /api/api-keys  (requires normal JWT login via `protect`)
async function createApiKey(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'A name/label for the key is required' });

    const { rawKey, keyHash, keyPreview } = ApiKey.generateKey();

    await ApiKey.create({ owner: req.user._id, name, keyHash, keyPreview });

    // rawKey is only ever shown once — the client must save it now
     res.status(201).json({
      message: 'Save this key now — it will not be shown again.',
      apiKey: rawKey,
      name,
      preview: keyPreview
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/api-keys
async function listApiKeys(req, res, next) {
  try {
    const keys = await ApiKey.find({ owner: req.user._id })
      .select('name keyPreview active lastUsedAt createdAt')
      .sort('-createdAt');
    res.json(keys);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/api-keys/:id
async function revokeApiKey(req, res, next) {
  try {
    const key = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { active: false },
      { new: true }
    );
    if (!key) return res.status(404).json({ message: 'API key not found' });
    res.json({ message: 'API key revoked' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createApiKey, listApiKeys, revokeApiKey };