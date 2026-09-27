const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

// ---------- HELPER: TOTAL CALCULATE KARNE KE LIYE ----------
function calculateTotals(items, taxRate, discountRate) {
  const subtotal = items.reduce((sum, item) => {
    return sum + (Number(item.qty) * Number(item.rate));
  }, 0);

  const discountAmt = subtotal * ((Number(discountRate) || 0) / 100);
  const taxAmt = (subtotal - discountAmt) * ((Number(taxRate) || 0) / 100);
  const grandTotal = subtotal - discountAmt + taxAmt;

  return {
    subtotal: subtotal,
    discountAmount: discountAmt,
    taxAmount: taxAmt,
    total: grandTotal
  };
}

// GET /api/invoices
async function getInvoices(req, res, next) {
  try {
    const invoices = await Invoice.find({ owner: req.user._id })
      .populate('client', 'name email address')
      .sort('-createdAt');
    res.json(invoices);
  } catch (err) {
    next(err);
  }
}

// GET /api/invoices/:id
async function getInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('client', 'name email address');
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

// POST /api/invoices
async function createInvoice(req, res, next) {
  try {
    const {
      client,
      invoiceNumber,
      currency,
      invoiceDate,
      dueDate,
      items,
      taxRate,
      discountRate,
      notes
    } = req.body;

    if (!client || !invoiceNumber || !invoiceDate || !items || items.length === 0) {
      return res.status(400).json({
        message: 'client, invoiceNumber, invoiceDate and at least one item are required'
      });
    }

    const clientExists = await Client.findOne({ _id: client, owner: req.user._id });
    if (!clientExists) return res.status(404).json({ message: 'Client not found' });

    // ---------- TOTAL CALCULATE KAREIN ----------
    const totals = calculateTotals(items, taxRate, discountRate);

    const invoice = await Invoice.create({
      owner: req.user._id,
      client,
      invoiceNumber,
      currency,
      invoiceDate,
      dueDate,
      items,
      taxRate,
      discountRate,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes
    });

    res.status(201).json(invoice);
  } catch (err) {
    next(err);
  }
}

// PUT /api/invoices/:id
async function updateInvoice(req, res, next) {
  try {
    const {
      client,
      invoiceNumber,
      currency,
      invoiceDate,
      dueDate,
      items,
      taxRate,
      discountRate,
      notes,
      status
    } = req.body;

    // ---------- TOTAL CALCULATE KAREIN ----------
    const totals = calculateTotals(items || [], taxRate, discountRate);

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        client,
        invoiceNumber,
        currency,
        invoiceDate,
        dueDate,
        items,
        taxRate,
        discountRate,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total,
        notes,
        status
      },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/invoices/:id
async function deleteInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
};