const express = require('express');
const router = express.Router();
const { authenticate, isModerator } = require('../middleware/auth');
const { postSupplier, getSupplier, getAllSupplier, editSupplier, supplierDeleteById } = require('../controllers/supplierController');

router.post('/supplier', authenticate, isModerator, postSupplier);
router.get('/supplier/:id', authenticate, isModerator, getSupplier);
router.get('/supplier', authenticate, isModerator, getAllSupplier);
router.put("/supplier/:id", authenticate, isModerator, editSupplier);
router.delete("/supplier/:id", authenticate, isModerator, supplierDeleteById);

module.exports = router;