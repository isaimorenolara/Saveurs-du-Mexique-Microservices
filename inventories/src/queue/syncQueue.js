const axios = require('axios');
const SyncOutbox = require('../models/syncOutbox.model');
const { config } = require('../config/env');

async function enqueueSync(evt) {
    await SyncOutbox.create(evt);
}

async function deliverOne(doc) {
    const url = `${config.productsBase}/products/internal/sync`;
    const secret = config.syncSecret;

    try {
        console.log('[sync] posting to', url, 'secret?', !!secret, 'doc:', {
            type: doc.type, productId: doc.productId
        });

        await axios.post(url, {
            type: doc.type,
            productId: doc.productId,
            payload: doc.payload || null
        }, {
            headers: { 'x-sync-secret': secret },
            timeout: 5500
        });

        doc.status = 'sent';
        doc.lastError = '';
        await doc.save();
    } catch (err) {
        doc.attempts += 1;
        doc.lastError = err?.message || 'unknown';
        if (doc.attempts >= 10) doc.status = 'dead';
        await doc.save();
        console.error('[sync] deliver failed:', doc.productId, doc.lastError);
    }
}

function startWorker() {
    setInterval(async () => {
        const batch = await SyncOutbox
            .find({ status: 'pending' })
            .sort({ createdAt: 1 })
            .limit(20);
        for (const doc of batch) await deliverOne(doc);
    }, 2000);
}

module.exports = { enqueueSync, startWorker };