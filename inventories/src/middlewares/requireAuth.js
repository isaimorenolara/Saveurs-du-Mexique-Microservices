const axios = require('axios');
const { config } = require('../config/env');

function bearer(req) { const a = req.headers.authorization || ''; return a.startsWith('Bearer ') ? a.slice(7) : ''; }

async function requireAuth(req, res, next) {
    try {
        const token = bearer(req);
        if (!token) return res.status(401).json({ status: 'error', error: 'MISSING_TOKEN' });
        const r = await axios.get(`${config.usersBase}/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 2500
        });
        req.user = r.data;
        next();
    } catch {
        return res.status(401).json({ status: 'error', error: 'UNAUTHORIZED' });
    }
}
module.exports = { requireAuth };