const { Schema, model } = require('mongoose');

const InventorySchema = new Schema({
    productId: { type: String, required: true, index: true },
    sellerId: { type: String, required: true, index: true },

    sku: { type: String, required: true, trim: true, unique: true },
    stock: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },

    approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    active: { type: Boolean, default: false },

    name: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, min: 0, default: 0 },
    images: [{ type: String, trim: true }],

    notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = model('Inventory', InventorySchema);