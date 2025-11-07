require('dotenv').config({ path: './.env' });

const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3001,
    mongoUrl: process.env.MONGO_URL || process.env.MONGO_URI,

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
};

if (!config.mongoUrl) console.warn('[users] Missing MONGO_URL/MONGO_URI');
if (!config.jwt.secret) throw new Error('[users] Missing JWT_SECRET');

module.exports = { config };