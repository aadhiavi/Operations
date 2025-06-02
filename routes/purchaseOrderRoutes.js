const express = require('express');
const { createPurchaseOrder, getAllPurchaseOrders, getPurchaseOrderById, updatePurchaseOrder, deletePurchaseOrder, getAllPurchaseOrdersStageWise } = require('../controllers/purchaseOrderController');
const { authenticate, isModerator} = require('../middleware/auth');
const router = express.Router();

router.post('/po', authenticate, isModerator, createPurchaseOrder);
router.get('/po', authenticate, isModerator, getAllPurchaseOrders);
router.get('/po-stages', authenticate, isModerator, getAllPurchaseOrdersStageWise);
router.get('/po/:id', authenticate, isModerator, getPurchaseOrderById);
router.put('/po/:id', authenticate, isModerator, updatePurchaseOrder);
router.delete('/po/:id', authenticate, isModerator, deletePurchaseOrder);

module.exports = router;
