const mongoose = require('mongoose');

async function connectDB() {
    const uri = process.env.MONGO_URL || process.env.MONGO_URI;
    if (!uri) {
        throw new Error('Missing MONGO_URL/MONGO_URI in environment variables');
    }

    mongoose.set('strictQuery', true);

    await mongoose.connect(uri);
    console.log('[products] Connected to MongoDB');

    mongoose.connection.on('error', (err) => {
        console.error('[products] MongoDB error:', err);
    });
}

module.exports = connectDB;