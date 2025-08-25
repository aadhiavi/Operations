const express = require('express');
const { getInventory, getItemHistory } = require('../controllers/InventoryControllers');
const router = express.Router();

router.get('/get', getInventory);
router.get('/history/:project/:boqItemId', getItemHistory)

module.exports = router;