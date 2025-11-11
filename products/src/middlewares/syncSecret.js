const { config } = require('../config/env');

function requireSyncSecret(req, res, next) {
    const incoming = req.headers['x-sync-secret'];
    // const expected = String(config.syncSecret || '').trim(); 
    
    // console.log('[products] recv x-sync-secret:', incoming);
    // console.log('[products] recv x-sync-secret:', incoming, `(len=${incoming.length})`);
    // console.log('[products] cfg  x-sync-secret:', expected, `(len=${expected.length})`);
    // console.log('[products] equals?', incoming === expected);

    if (!incoming || incoming !== config.syncSecret) {
        return res.status(403).json({ status: 'error', error: 'FORBIDDEN_SYNC' });
    }
    next();
}
module.exports = { requireSyncSecret };