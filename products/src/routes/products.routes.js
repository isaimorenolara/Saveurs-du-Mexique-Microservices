const { Router } = require('express');
const { requireAuth } = require('../middlewares/requireAuth');
const { requireSyncSecret } = require('../middlewares/syncSecret');
const { listProducts, searchProducts, internalSync } = require('../controllers/products.controller');

const router = Router();

router.get('/', listProducts);         
router.get('/search', searchProducts);

router.post('/internal/sync', requireSyncSecret, internalSync);

module.exports = router;