require('dotenv').config({ override: true });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3001;

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`[users] listening on :${PORT}`));
    } catch (err) {
        console.error('[users] failed to start:', err);
        process.exit(1);
    }
})();