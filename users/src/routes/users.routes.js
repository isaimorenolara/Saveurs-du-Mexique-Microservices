const { Router } = require('express');
const { me, updateProfile, listUsers } = require('../controllers/users.controller');
const { requireAuth, requireAdmin } = require('../middlewares/requireAuth');

const router = Router();

router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateProfile);
router.patch('/users/:id', requireAuth, updateProfile);
router.get('/users/list', requireAuth, requireAdmin, listUsers);

module.exports = router;