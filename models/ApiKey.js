const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true, unique: true },
    keyPreview: { type: String, required: true },
    active: { type: Boolean, default: true },
    lastUsedAt: { type: Date }
  },
  { timestamps: true }
);

// Generates a raw API key (shown to the user once) and its hash (stored in DB)
apiKeySchema.statics.generateKey = function () {
  const rawKey = 'ig_' + crypto.randomBytes(24).toString('hex');
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPreview = rawKey.slice(0, 10) + '...' + rawKey.slice(-4);
  return { rawKey, keyHash, keyPreview };
};

apiKeySchema.statics.hashKey = function (rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);