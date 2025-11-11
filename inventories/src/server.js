require('dotenv').config({ override: true });
const connectDB = require('./config/db');
const app = require('./app');
const { startWorker } = require('./queue/syncQueue');

const PORT = process.env.PORT || 3002;

(async () => {
    try {
        await connectDB();
        startWorker();
        app.listen(PORT, () => console.log(`[inventories] listening on :${PORT}`));
    } catch (err) {
        console.error('[inventories] failed to start:', err);
        process.exit(1);
    }
})();