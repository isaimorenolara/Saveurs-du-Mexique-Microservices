const Inventory = require('../models/inventory.model');
const { enqueueSync } = require('../queue/syncQueue');
const { isAdmin, ownerOrAdmin } = require('../helpers/roles');

async function createInventory(req, res) {
    try {
        const sellerId = req.user?._id;
        const { productId, sku, stock = 0, notes = '',
            name = '', description = '', price = 0, images = [] } = req.body;

        if (!productId || !sku) return res.status(400).json({ status: 'error', error: 'MISSING_FIELDS' });

        const inv = await Inventory.create({
            productId, sku, stock, sellerId, approval: 'pending', active: false, notes,
            name, description, price, images
        });

        await enqueueSync({
            type: 'UPSERT', productId,
            payload: {
                productId, sellerId, approval: 'pending', active: false, stock,
                name, description, price, images
            }
        });

        res.json({ status: 'success', inventory: inv });
    } catch {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function updateInventory(req, res) {
    try {
        const inv = await Inventory.findById(req.params.id);
        if (!inv) return res.status(404).json({ status: 'error', error: 'NOT_FOUND' });
        if (!ownerOrAdmin(req, inv)) return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });

        const { sku, stock, active, notes, name, description, price, images } = req.body;

        if (typeof sku === 'string') inv.sku = sku;
        if (typeof stock === 'number' && stock >= 0) inv.stock = stock;
        if (typeof active === 'boolean') inv.active = active;
        if (typeof notes === 'string') inv.notes = notes;

        if (typeof name === 'string') inv.name = name.trim();
        if (typeof description === 'string') inv.description = description.trim();
        if (typeof price === 'number' && price >= 0) inv.price = price;
        if (Array.isArray(images)) inv.images = images.map(String);

        await inv.save();

        await enqueueSync({
            type: 'UPSERT', productId: inv.productId,
            payload: {
                productId: inv.productId, active: inv.active, stock: inv.stock,
                name: inv.name, description: inv.description, price: inv.price, images: inv.images
            }
        });

        res.json({ status: 'success', inventory: inv });
    } catch {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function deleteInventory(req, res) {
    try {
        const inv = await Inventory.findById(req.params.id);
        if (!inv) return res.status(404).json({ status: 'error', error: 'NOT_FOUND' });
        if (!ownerOrAdmin(req, inv)) return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });

        await inv.deleteOne();
        await enqueueSync({ type: 'DELETE', productId: inv.productId });

        res.json({ status: 'success' });
    } catch (e) {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function listMyInventory(req, res) {
    try {
        const page = Math.max(1, +req.query.page || 1);
        const pageSize = Math.min(50, Math.max(1, +req.query.pageSize || 10));
        const q = { sellerId: req.user?._id };
        if (req.query.approval) q.approval = req.query.approval;
        const total = await Inventory.countDocuments(q);
        const items = await Inventory.find(q).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize);
        res.json({ status: 'success', pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) }, items });
    } catch (e) {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

async function approveInventory(req, res) {
    try {
        if (!isAdmin(req)) return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });
        const inv = await Inventory.findById(req.params.id);
        if (!inv) return res.status(404).json({ status: 'error', error: 'NOT_FOUND' });

        const { decision = 'approved' } = req.body;
        inv.approval = decision === 'rejected' ? 'rejected' : 'approved';
        if (inv.approval === 'approved') inv.active = true;
        await inv.save();

        await enqueueSync({
            type: 'UPSERT',
            productId: inv.productId,
            payload: { productId: inv.productId, approval: inv.approval, active: inv.active }
        });

        res.json({ status: 'success', inventory: inv });
    } catch {
        res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
    }
}

module.exports = { createInventory, updateInventory, deleteInventory, listMyInventory, approveInventory };