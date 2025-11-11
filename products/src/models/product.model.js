const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
    productId: { type: String, unique: true, index: true },
    name: { type: String, trim: true, index: 'text' },
    description: { type: String, trim: true, index: 'text' },
    price: { type: Number, min: 0 },
    images: [{ type: String, trim: true }],

    approval: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    active: { type: Boolean, default: false, index: true },
    stock: { type: Number, default: 0, min: 0 },

    sellerId: { type: String, index: true },
}, { timestamps: true });

ProductSchema.index({ createdAt: -1 });

module.exports = model('Product', ProductSchema);