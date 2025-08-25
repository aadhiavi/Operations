const express = require('express');
const Delivery = require('../models/Delivery');
const Inventory = require('../models/Inventory');

const deliveryController = async (req, res) => {
    try {
        const po = req.body;

        // Build delivery data
        const deliveryData = {
            purchaseOrderId: po.purchaseOrderId,
            purchaseOrderNo: po.purchaseOrderNo,
            deliveryDate: new Date(),
            project: po.project,
            deliveryNoteNumber: po.deliveryNoteNumber,
            receivedBy: {
                userId: po.receivedBy.userId,
                name: po.receivedBy.name
            },
            inspectionStatus: po.inspectionStatus,
            deliveredItems: po.deliveredItems.map(item => ({
                boqItemId: item.boqItemId._id || item.boqItemId,
                itemName: item.itemName,
                category: item.category,
                quantity: item.quantity,
                isItemConfirmed: item.isItemConfirmed,
                isQuantityCorrect: item.isQuantityCorrect,
                actualReceivedQuantity: item.actualReceivedQuantity
            }))
        };

        // Check for existing delivery
        const existingDelivery = await Delivery.findOne({ purchaseOrderId: po.purchaseOrderId });
        if (existingDelivery) {
            return res.status(400).json({ error: 'Delivery for this Purchase Order already exists' });
        }

        // Save delivery
        const delivery = new Delivery(deliveryData);
        const saved = await delivery.save();

        // ====== Create Inventory from deliveredItems ======
        const grouped = {};

        po.deliveredItems.forEach(item => {
            const category = item.category;
            if (!grouped[category]) {
                grouped[category] = {
                    category,
                    categoryItems: []
                };
            }

            grouped[category].categoryItems.push({
                boqItemId: item.boqItemId._id || item.boqItemId,
                itemName: item.itemName,
                quantity: item.quantity,
                isItemConfirmed: item.isItemConfirmed || false,
                isQuantityCorrect: item.isQuantityCorrect ?? true,
                actualReceivedQuantity: item.actualReceivedQuantity
            });
        });

        const inventoryData = {
            purchaseOrderId: po.purchaseOrderId,
            purchaseOrderNo: po.purchaseOrderNo,
            deliveryDate: deliveryData.deliveryDate,
            project: po.project,
            deliveryNoteNumber: po.deliveryNoteNumber,
            receivedBy: deliveryData.receivedBy,
            categories: Object.values(grouped)
        };

        await Inventory.create(inventoryData);

        res.status(201).json({
            message: 'Delivery and Inventory created successfully',
            deliveryId: saved._id
        });
    } catch (error) {
        console.error('Error creating delivery and inventory:', error);
        res.status(500).json({ error: 'Failed to create delivery/inventory' });
    }
};

// const deliveryController = async (req, res) => {
//     try {
//         const po = req.body;

//         const deliveryData = {
//             purchaseOrderId: po.purchaseOrderId,
//             purchaseOrderNo: po.purchaseOrderNo,
//             deliveryDate: new Date(),
//             project: po.project,
//             deliveryNoteNumber: po.deliveryNoteNumber,
//             receivedBy: {
//                 userId: po.receivedBy.userId,
//                 name: po.receivedBy.name
//             },
//             inspectionStatus: po.inspectionStatus,
//             deliveredItems: po.deliveredItems.map(item => ({
//                 boqItemId: item.boqItemId._id || item.boqItemId,
//                 itemName: item.itemName,
//                 category: item.category,
//                 quantity: item.quantity,
//                 isItemConfirmed: item.isItemConfirmed,
//                 isQuantityCorrect: item.isQuantityCorrect,
//                 actualReceivedQuantity: item.actualReceivedQuantity
//             }))
//         };
//         const existingDelivery = await Delivery.findOne({ purchaseOrderId: po.purchaseOrderId });
//         if (existingDelivery) {
//             return res.status(400).json({ error: 'Delivery for this Purchase Order already exists' });
//         }
//         const delivery = new Delivery(deliveryData);
//         const saved = await delivery.save();
//         console.log(po.deliveryNoteNumber)
//         res.status(201).json({ message: 'Delivery created successfully', deliveryId: saved._id });
//     } catch (error) {
//         console.error('Error creating delivery:', error);
//         res.status(500).json({ error: 'Failed to create delivery' });
//     }
// };

const getDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find();
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ error: 'Failed to fetch deliveries' });
    }
};

const getDeliveriesById = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const deliveryData = await Delivery.findById(deliveryId)
        if (!deliveryData) {
            return res.status(400).json({ message: 'Id not found' })
        }
        res.status(200).json({ message: 'Data fetched succussfully', deliveryData })
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" })
    }

}

module.exports = { deliveryController, getDeliveries, getDeliveriesById };

