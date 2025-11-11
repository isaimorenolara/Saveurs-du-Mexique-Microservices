require('dotenv').config({ path: './.env' });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3002,
    mongoUrl: process.env.MONGO_URL || process.env.MONGO_URI,
    usersBase: process.env.USERS_BASE,
    productsBase: process.env.PRODUCTS_BASE,
    syncSecret: process.env.SYNC_SECRET,
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
};

if (!config.mongoUrl) throw new Error('[inventories] Missing MONGO_URL');
if (!config.usersBase) console.warn('[inventories] Missing USERS_BASE (requireAuth usará /me)');
if (!config.productsBase) console.warn('[inventories] Missing PRODUCTS_BASE');
if (!config.syncSecret) console.warn('[inventories] Missing SYNC_SECRET');

module.exports = { config };