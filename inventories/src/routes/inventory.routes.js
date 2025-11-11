const { Router } = require('express');
const { requireAuth } = require('../middlewares/requireAuth');
const { createInventory, updateInventory, deleteInventory, listMyInventory, approveInventory } = require('../controllers/inventory.controller');

const router = Router();

router.get('/', requireAuth, listMyInventory);              
router.post('/', requireAuth, createInventory);             
router.put('/:id', requireAuth, updateInventory);          
router.delete('/:id', requireAuth, deleteInventory);       
router.post('/:id/approve', requireAuth, approveInventory);

module.exports = router;