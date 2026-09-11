const mongoose = require('mongoose');
const clientSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true }
  },
  { timestamps: true }
);
module.exports = mongoose.model('Client', clientSchema);