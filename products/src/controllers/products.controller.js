const Product = require('../models/product.model');

const ALLOWED = new Set([
    'productId', 'sellerId',
    'name', 'description', 'price', 'images',
    'approval', 'active', 'stock'
]);

function pickAllowed(obj = {}) {
    const out = {};
    for (const k of Object.keys(obj)) if (ALLOWED.has(k)) out[k] = obj[k];
    return out;
}

async function listProducts(req, res) {
    try {
        const page = Math.max(1, +req.query.page || 1);
        const pageSize = Math.min(50, Math.max(1, +req.query.pageSize || 10));
        const sortBy = req.query.sortBy === 'name' ? { name: 1 } : { createdAt: -1 };
        const q = {};
        if (req.query.active) q.active = req.query.active === 'true';
        if (req.query.approval) q.approval = req.query.approval;

        const total = await Product.countDocuments(q);
        const items = await Product.find(q).sort(sortBy).skip((page - 1) * pageSize).limit(pageSize);
        res.json({ status: 'success', pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }, items });
    } catch (e) {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function searchProducts(req, res) {
    try {
        const qtext = (req.query.q || '').trim();
        if (!qtext) return res.json({ status: 'success', items: [] });

        const page = Math.max(1, +req.query.page || 1);
        const pageSize = Math.min(50, Math.max(1, +req.query.pageSize || 10));

        const query = {
            $and: [
                { active: true },
                { approval: 'approved' },
                { $text: { $search: qtext } }
            ]
        };

        const total = await Product.countDocuments(query);
        const items = await Product.find(query, { score: { $meta: 'textScore' } })
            .sort({ score: { $meta: 'textScore' } })
            .skip((page - 1) * pageSize).limit(pageSize);

        res.json({ status: 'success', pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }, items });
    } catch (e) {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function internalSync(req, res) {
    try {
        const { type, productId, payload } = req.body || {};
        if (!type || !productId) return res.status(400).json({ status: 'error', error: 'BAD_EVENT' });

        if (type === 'DELETE') {
            await Product.deleteOne({ productId });
            return res.json({ status: 'ok' });
        }

        const $set = pickAllowed({ ...payload, productId });
        await Product.updateOne({ productId }, { $set }, { upsert: true });

        res.json({ status: 'ok' });
    } catch {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

module.exports = { listProducts, searchProducts, internalSync };