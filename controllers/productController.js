const mongoose = require('mongoose');
const Product = require('../models/Product');

// GET /api/products?search=&page=&limit=
async function getProducts(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };
    const search = req.query.search ? req.query.search.trim() : '';
    if (search) {
      filter.name = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort('name').skip(skip).limit(limit),
      Product.countDocuments(filter)
    ]);

    res.json({ products, pagination: { total, page, limit } });
  } catch (err) {
    next(err);
  }
}

// POST /api/products
async function createProduct(req, res, next) {
  try {
    const { name, rate, description } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Item name is required' });
    if (rate === undefined || rate === null || isNaN(rate)) {
      return res.status(400).json({ message: 'A valid rate is required' });
    }

    const product = await Product.create({ owner: req.user._id, name, rate, description });
    res.status(201).json(product);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
}

// PUT /api/products/:id
async function updateProduct(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const { name, rate, description } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (rate !== undefined) updates.rate = rate;
    if (description !== undefined) updates.description = description;

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Item not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id
async function deleteProduct(req, res, next) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    const product = await Product.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!product) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    next(err);
  }
}

// POST /api/products/import
// Body: { items: [{ name, rate, description? }, ...] }  (parsed from CSV on the frontend)
async function importProducts(req, res, next) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for import' });
    }

    let inserted = 0;
    let skipped = 0;
    const docs = [];

    for (const item of items) {
      const name = (item.name || '').toString().trim();
      const rate = parseFloat(item.rate);
      if (!name || isNaN(rate) || rate < 0) {
        skipped++;
        continue;
      }
      docs.push({
        owner: req.user._id,
        name,
        rate,
        description: (item.description || '').toString().trim()
      });
    }

    if (docs.length > 0) {
      const result = await Product.insertMany(docs, { ordered: false });
      inserted = result.length;
    }

    res.status(201).json({ message: 'Import complete', inserted, skipped });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  importProducts
};
