require('dotenv').config({ override: true });
const connectDB = require('./config/db');
const app = require('./app');

const PORT = process.env.PORT || 3003;

(async () => {
    try {
        await connectDB();
        app.listen(PORT, () => console.log(`[products] listening on :${PORT}`));
    } catch (err) {
        console.error('[products] failed to start:', err);
        process.exit(1);
    }
})();