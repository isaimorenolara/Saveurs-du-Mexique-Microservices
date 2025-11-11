const { Schema, model } = require('mongoose');

const SyncOutboxSchema = new Schema({
    type: { type: String, enum: ['UPSERT', 'DELETE'], required: true },
    productId: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed },
    attempts: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'sent', 'dead'], default: 'pending', index: true },
    lastError: { type: String, default: '' },
}, { timestamps: true });

module.exports = model('SyncOutbox', SyncOutboxSchema);