const express = require('express');
const {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrdersStageWise,
    getPurchaseOrders,
    withdrawPurchaseOrder,
    getPurchaseOrderByPoNumber
} = require('../controllers/purchaseOrderController');
const { authenticate, isModerator } = require('../middleware/auth');
const router = express.Router();

router.post('/po', createPurchaseOrder);
router.delete('/po/:poId/withdraw', withdrawPurchaseOrder);
router.get('/po', authenticate, isModerator, getAllPurchaseOrders);
router.get('/po-stages', authenticate, isModerator, getAllPurchaseOrdersStageWise);
router.get('/po/:id', getPurchaseOrderById);
router.get('/po-number/:poNumber', getPurchaseOrderByPoNumber);
router.put('/po/:id', authenticate, isModerator, updatePurchaseOrder);
router.delete('/po/:id', authenticate, isModerator, deletePurchaseOrder);
router.get('/pos', getPurchaseOrders)

module.exports = router;
