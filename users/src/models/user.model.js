const { Schema, model } = require('mongoose');

const AddressSchema = new Schema({
    street: { type: String, default: '' },
    streetNumber: { type: String, default: '' },
    zip: { type: String, default: '' },
}, { _id: false });

const UserSchema = new Schema({
    email: { type: String, unique: true, index: true, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer', index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    dob: { type: String, default: '' },
    address: { type: AddressSchema, default: () => ({}) },
}, { timestamps: true });

module.exports = model('User', UserSchema);