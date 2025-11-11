const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { config } = require('./config/env');

const inventoryRoutes = require('./routes/inventory.routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'inventories' }));

if (typeof inventoryRoutes !== 'function') {
    console.error('[inventories] inventoryRoutes is not an Express Router. Value:', inventoryRoutes);
}

if (typeof inventoryRoutes === 'function') app.use('/inventories', inventoryRoutes);

app.use((req, res) => res.status(404).json({ status: 'error', error: 'NOT_FOUND' }));

app.use((err, _req, res, _next) => {
    console.error('[inventories] Unhandled error:', err);
    res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
});

module.exports = app;