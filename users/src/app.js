const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const { config } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: config.cors.credentials }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'users' }));

if (typeof authRoutes !== 'function') {
    console.error('[users] authRoutes is not an Express Router. Value:', authRoutes);
}
if (typeof usersRoutes !== 'function') {
    console.error('[users] usersRoutes is not an Express Router. Value:', usersRoutes);
}

if (typeof authRoutes === 'function') app.use('/auth', authRoutes);
if (typeof usersRoutes === 'function') app.use('/', usersRoutes);

app.use((req, res) => res.status(404).json({ status: 'error', error: 'NOT_FOUND' }));

app.use((err, _req, res, _next) => {
    console.error('[users] Unhandled error:', err);
    res.status(500).json({ status: 'error', error: 'INTERNAL_ERROR' });
});

module.exports = app;