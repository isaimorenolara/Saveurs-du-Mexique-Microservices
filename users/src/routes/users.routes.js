const { Router } = require('express');
const { me, updateProfile } = require('../controllers/users.controller');
const { requireAuth } = require('../middlewares/requireAuth');

const router = Router();

router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
router.patch('/users/:id', requireAuth, updateProfile);

module.exports = router;