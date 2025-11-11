require('dotenv').config({ path: './.env' });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3003,
    mongoUrl: process.env.MONGO_URL || process.env.MONGO_URI,
    usersBase: process.env.USERS_BASE,
    syncSecret: process.env.SYNC_SECRET,
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
};

if (!config.mongoUrl) throw new Error('[products] Missing MONGO_URL');
if (!config.usersBase) console.warn('[products] Missing USERS_BASE (requireAuth usará /me)');
if (!config.syncSecret) console.warn('[products] Missing SYNC_SECRET');

module.exports = { config };