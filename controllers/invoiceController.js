const Invoice = 
require('../models/Invoice');
const Client = require('../models/Client');
// GET /api/invoices
async function getInvoices(req, res, next) 
{
  try {
    const invoices = await Invoice.find({ 
    owner: req.user._id })
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
    if (!invoice) return 
      res.status(404).json({ message: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    next(err);
  }
}
// POST /api/invoices
async function createInvoice(req, res, next) {
    try {
    const { client, invoiceNumber, currency, invoiceDate, dueDate, items, taxRate, discountRate, notes }
     = req.body;
    if (!client || !invoiceNumber || !invoiceDate || !items || items.length === 0) {
      return res.status(400).json({ message: 'client, invoiceNumber, invoiceDate and at least one item are required' });
    }
    const clientExists = await 
     Client.findOne({ _id: client, owner: req.user._id });
    if (!clientExists) return res.status(404).json({ message: 'Client not found' });
     
    const invoice = await Invoice.create({owner: req.user._id, client, invoiceNumber, currency, invoiceDate, dueDate, items, taxRate, discountRate, notes  });
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
    const invoice = await 
   Invoice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    next(err);
  }
}
module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice};
