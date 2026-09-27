const mongoose = require('mongoose');
const itemSchema = new mongoose.Schema(
    {
        description: { type: String, required: true },
        qty: { type: Number, required: true, min: 0 },
        rate: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const invoiceSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
        invoiceNumber: { type: String, required: true },
        currency: { type: String, default: '$' },
        invoiceDate: { type: Date, required: true },
        dueDate: { type: Date },
        items: { type: [itemSchema], required: true, validate: v => v.length > 0 },
        taxRate: { type: Number, default: 0 },
        discountRate: { type: Number, default: 0 },
        
        // ========== YEH NAYE FIELDS ADD KIYE GAYE HAIN ==========
        subtotal: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        // ========================================================

        notes: { type: String },
        status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue'], default: 'draft' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Invoice', invoiceSchema);