const express = require('express');
const { deliveryController, getDeliveries, getDeliveriesById } = require('../controllers/deliveryControllers');
const router = express.Router();

router.post('/post', deliveryController);
router.get('/get', getDeliveries);
router.get('/get/:deliveryId', getDeliveriesById)

module.exports = router;