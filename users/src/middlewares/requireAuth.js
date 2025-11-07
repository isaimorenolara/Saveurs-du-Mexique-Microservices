const { verifyToken } = require('../utils/jwt');
const User = require('../models/user.model');

function bearer(req) {
    const raw = req.headers.authorization || '';
    return raw.startsWith('Bearer ') ? raw.slice(7) : '';
}

function requireAuth(req, res, next) {
    try {
        const token = bearer(req);
        if (!token) return res.status(401).json({ status: 'error', error: 'MISSING_TOKEN' });
        req.user = verifyToken(token);
        next();
    } catch {
        return res.status(401).json({ status: 'error', error: 'UNAUTHORIZED' });
    }
}

async function requireAuthWithUser(req, res, next) {
    try {
        const token = bearer(req);
        if (!token) return res.status(401).json({ status: 'error', error: 'MISSING_TOKEN' });
        const payload = verifyToken(token);
        req.user = payload;
        const doc = await User.findById(payload.sub);
        if (!doc) return res.status(401).json({ status: 'error', error: 'INVALID_TOKEN' });
        req.userDoc = doc;
        next();
    } catch {
        return res.status(401).json({ status: 'error', error: 'UNAUTHORIZED' });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ status: 'error', error: 'FORBIDDEN' });
    }
    next();
}

module.exports = { requireAuth, requireAuthWithUser, requireAdmin };