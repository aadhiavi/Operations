const mongoose = require('mongoose');
const MaterialRequisition = require("../models/MaterialRequisition");
const TestBoqItem = require("../models/TestBoqItem");

//for creating the requisition 
const createRequisition = async (req, res) => {
    try {
        const { projectId, number, items } = req.body;

        if (!number || !number.trim()) {
            return res.status(400).json({ message: "Requisition number is required" });
        }

        const existingRequisition = await MaterialRequisition.findOne({ number: number.trim() });
        if (existingRequisition) {
            return res.status(409).json({ message: "Requisition number already exists" });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "At least one item is required" });
        }

        const validatedItems = [];

        for (const item of items) {
            const { boqItemId, quantityRequested, remarks } = item;

            const boqItem = await TestBoqItem.findById(boqItemId);
            if (!boqItem) {
                return res.status(404).json({ message: `BoQ item ${boqItemId} not found` });
            }

            const existingRequisitions = await MaterialRequisition.aggregate([
                { $unwind: "$items" },
                { $match: { "items.boqItemId": boqItem._id } },
                { $group: { _id: null, total: { $sum: "$items.quantityRequested" } } }
            ]);

            const alreadyRequested = existingRequisitions[0]?.total || 0;
            const remainingQty = boqItem.quantity - alreadyRequested;

            if (quantityRequested > remainingQty) {
                return res.status(400).json({
                    message: `Requested quantity for '${boqItem.itemName}' exceeds remaining (${remainingQty})`
                });
            }

            validatedItems.push({
                boqItemId,
                quantityRequested,
                quantityRemaining: quantityRequested,
                remarks
            });
        }

        const requisition = await MaterialRequisition.create({
            projectId,
            number,
            items: validatedItems
        });

        res.status(201).json({ message: "Requisition created", requisition });
    } catch (error) {
        console.error("Error creating requisition:", error);
        res.status(500).json({ message: "Server error" });
    }
};

//getting requisition all lists
const getRequisitions = async (req, res) => {
    try {
        const requisitions = await MaterialRequisition.find()
            .populate("projectId", "name")
            .populate("items.boqItemId", "itemCode itemName unit quantity remarks")
            .lean();

        res.json(requisitions);
    } catch (err) {
        console.error("Error fetching requisitions:", err);
        res.status(500).json({ error: "Server error" });
    }
};

//get requisition by number
// const getRequisitionByNumber = async (req, res) => {
//     try {
//         const { number } = req.params;
//         const requisition = await MaterialRequisition.findOne({ number })
//             .populate("projectId", "name")
//             .populate("items.boqItemId", "itemCode itemName unit quantity remarks");

//         if (!requisition) {
//             return res.status(404).json({ message: "Requisition not found" });
//         }

//         res.status(200).json(requisition);
//     } catch (error) {
//         console.error("Error fetching requisition by number:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

// const getRequisitionByNumber = async (req, res) => {
//     try {
//         const { number } = req.params;

//         const requisition = await MaterialRequisition.findOne({ number })
//             .populate("projectId", "name")
//             .populate("items.boqItemId", "itemCode itemName unit quantity remarks")
//             .lean();

//         if (!requisition) {
//             return res.status(404).json({ message: "Requisition not found" });
//         }

//         const boqItemIds = requisition.items.map(item =>
//             item.boqItemId._id ? item.boqItemId._id : item.boqItemId
//         );

//         // Aggregate total requested quantity per BoQ item across all requisitions
//         const aggregated = await MaterialRequisition.aggregate([
//             { $unwind: "$items" },
//             {
//                 $match: {
//                     "items.boqItemId": {
//                         $in: boqItemIds.map(id => new mongoose.Types.ObjectId(id))
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$items.boqItemId",
//                     totalRequested: { $sum: "$items.quantityRequested" }
//                 }
//             }
//         ]);

//         const requestedMap = aggregated.reduce((acc, item) => {
//             acc[item._id.toString()] = item.totalRequested;
//             return acc;
//         }, {});

//         // Inject availableQuantityForNewBoq and maintain original structure
//         requisition.items = requisition.items.map(item => {
//             const boqItem = item.boqItemId;
//             const totalRequested = requestedMap[boqItem._id.toString()] || 0;
//             const availableQuantityForNewBoq = Math.max(0, boqItem.quantity - totalRequested);

//             return {
//                 ...item,
//                 boqItemId: {
//                     ...boqItem,
//                 },
//                 availableQuantityForNewBoq // <<-- new field added here
//             };
//         });

//         res.status(200).json(requisition);
//     } catch (error) {
//         console.error("Error fetching requisition by number:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// };

const getRequisitionByNumber = async (req, res) => {
    try {
        const { number } = req.params;

        const requisition = await MaterialRequisition.findOne({ number })
            .populate("projectId", "name")
            .populate("items.boqItemId", "itemCode itemName unit quantity remarks")
            .lean();

        if (!requisition) {
            return res.status(404).json({ message: "Requisition not found" });
        }

        const boqItemIds = requisition.items.map(item =>
            item.boqItemId._id ? item.boqItemId._id : item.boqItemId
        );

        // Aggregate total requested quantity per BoQ item across all requisitions
        const aggregated = await MaterialRequisition.aggregate([
            { $unwind: "$items" },
            {
                $match: {
                    "items.boqItemId": {
                        $in: boqItemIds.map(id => new mongoose.Types.ObjectId(id))
                    }
                }
            },
            {
                $group: {
                    _id: "$items.boqItemId",
                    totalRequested: { $sum: "$items.quantityRequested" }
                }
            }
        ]);

        const requestedMap = aggregated.reduce((acc, item) => {
            acc[item._id.toString()] = item.totalRequested;
            return acc;
        }, {});

        // Check if all quantityRemaining are zero
        let allZero = true;

        requisition.items = requisition.items.map(item => {
            const boqItem = item.boqItemId;
            const totalRequested = requestedMap[boqItem._id.toString()] || 0;
            const availableQuantityForNewBoq = Math.max(0, boqItem.quantity - totalRequested);

            if (item.quantityRemaining > 0) {
                allZero = false;
            }

            return {
                ...item,
                boqItemId: {
                    ...boqItem,
                },
                availableQuantityForNewBoq
            };
        });

        // Update status to "Closed" if all quantityRemaining are zero
        requisition.status = allZero ? "Closed" : requisition.status;

        res.status(200).json(requisition);
    } catch (error) {
        console.error("Error fetching requisition by number:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAvailableItems = async (req, res) => {
    try {
        const boqItemId = req.params.boqItemId;

        if (!mongoose.Types.ObjectId.isValid(boqItemId)) {
            return res.status(400).json({ message: "Invalid BoQ item ID" });
        }

        const totalRequested = await MaterialRequisition.aggregate([
            { $unwind: "$items" },
            { $match: { "items.boqItemId": new mongoose.Types.ObjectId(boqItemId) } },
            {
                $group: {
                    _id: null,
                    totalRequested: { $sum: "$items.quantityRequested" }
                }
            }
        ]);

        const boqItem = await TestBoqItem.findById(boqItemId).lean();
        if (!boqItem) {
            return res.status(404).json({ message: "BoQ item not found" });
        }

        const already = totalRequested[0]?.totalRequested || 0;
        const available = Math.max(0, boqItem.quantity - already);

        res.json({
            boqItemId,
            itemName: boqItem.itemName,
            unit: boqItem.unit,
            quantity: boqItem.quantity,
            availableQuantity: available
        });
    } catch (err) {
        console.error("Error in getAvailableItems:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// update requisition
// const updateRequisition = async (req, res) => {
//     try {
//         const { number } = req.params;
//         const { items: updatedItems } = req.body;

//         if (!Array.isArray(updatedItems)) {
//             return res.status(400).json({ message: "Invalid or missing 'items' array in request body." });
//         }

//         // Get the requisition and populate BoQ data
//         const requisition = await MaterialRequisition.findOne({ number })
//             .populate("items.boqItemId", "quantity")
//             .lean();

//         if (!requisition) {
//             return res.status(404).json({ message: "Requisition not found" });
//         }

//         // Step 1: Build map of total requested for each BoQ ID (excluding this requisition)
//         const boqItemIds = requisition.items.map(item => item.boqItemId._id.toString());

//         const allRequested = await MaterialRequisition.aggregate([
//             { $unwind: "$items" },
//             {
//                 $match: {
//                     number: { $ne: number }, // exclude current requisition
//                     "items.boqItemId": { $in: boqItemIds.map(id => new mongoose.Types.ObjectId(id)) }
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$items.boqItemId",
//                     totalRequested: { $sum: "$items.quantityRequested" }
//                 }
//             }
//         ]);

//         const externalRequestedMap = allRequested.reduce((acc, item) => {
//             acc[item._id.toString()] = item.totalRequested;
//             return acc;
//         }, {});

//         // Step 2: Validate and update items
//         const updatedRequisition = await MaterialRequisition.findOne({ number });

//         updatedItems.forEach(upItem => {
//             const item = updatedRequisition.items.id(upItem._id);
//             if (!item) throw new Error(`Item with ID ${upItem._id} not found`);

//             const boqId = item.boqItemId.toString();
//             const boqQuantity = requisition.items.find(i => i._id.toString() === upItem._id)?.boqItemId?.quantity || 0;
//             const externalRequested = externalRequestedMap[boqId] || 0;
//             const available = boqQuantity - externalRequested;

//             if (upItem.quantityRequested > available) {
//                 throw new Error(`Cannot request more than available quantity (${available}) for item ID ${upItem._id}`);
//             }

//             item.quantityRequested = upItem.quantityRequested;
//             item.quantityRemaining = upItem.quantityRequested;
//             if (typeof upItem.remarks === "string") {
//                 item.remarks = upItem.remarks;
//             }
//         });

//         await updatedRequisition.save();

//         res.status(200).json({ message: "Requisition updated successfully", requisition: updatedRequisition });
//     } catch (err) {
//         console.error("Update error:", err);
//         res.status(400).json({ message: err.message || "Update failed" });
//     }
// };

const updateRequisition = async (req, res) => {
    try {
        const { number } = req.params;
        const { items: updatedItems } = req.body;

        if (!Array.isArray(updatedItems)) {
            return res.status(400).json({ message: "'items' must be an array" });
        }

        const requisition = await MaterialRequisition.findOne({ number });
        if (!requisition) {
            return res.status(404).json({ message: "Requisition not found" });
        }

        // ❌ Block updates if the requisition is Closed
        if (requisition.status === "Closed") {
            return res.status(403).json({ message: "Cannot edit a closed requisition" });
        }

        for (const updatedItem of updatedItems) {
            const existingItem = requisition.items.id(updatedItem._id);
            if (!existingItem) {
                return res.status(400).json({ message: `Item with ID ${updatedItem._id} not found` });
            }

            // Calculate difference between new and old requested quantity
            const diff = updatedItem.quantityRequested - existingItem.quantityRequested;

            // Get current remaining quantity, handle undefined
            const currentRemaining = (typeof existingItem.quantityRemaining === 'number')
                ? existingItem.quantityRemaining
                : existingItem.quantityRequested;

            // Calculate what the new remaining would be
            const newRemaining = currentRemaining + diff;

            // If remaining quantity would go negative, throw error and prevent update
            if (newRemaining < 0) {
                return res.status(400).json({
                    message: `Cannot update requested quantity to ${updatedItem.quantityRequested} because remaining quantity would become negative for item ID ${updatedItem._id}`
                });
            }

            // Update requested quantity and remaining quantity
            existingItem.quantityRequested = updatedItem.quantityRequested;
            existingItem.quantityRemaining = newRemaining;

            // Optional: update remarks if provided
            if ('remarks' in updatedItem) {
                existingItem.remarks = updatedItem.remarks;
            }
        }

        // Recalculate if all remaining quantities are zero
        const allRemainingZero = requisition.items.every(item => item.quantityRemaining === 0);
        if (allRemainingZero) {
            requisition.status = "Closed";
        }

        await requisition.save();

        res.status(200).json({
            message: "Requisition updated successfully",
            requisition
        });

    } catch (error) {
        console.error("Error updating requisition:", error);
        res.status(500).json({ message: error.message || "Failed to update requisition" });
    }
};

const addItemsToRequisition = async (req, res) => {
    try {
        const { number } = req.params;
        const { items } = req.body;

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "No items provided" });
        }

        const requisition = await MaterialRequisition.findOne({ number });
        if (!requisition) {
            return res.status(404).json({ message: "Requisition not found" });
        }

        if (requisition.status === "Closed") {
            return res.status(403).json({ message: "Cannot edit a closed requisition" });
        }

        const validatedItems = [];

        for (const item of items) {
            const { boqItemId, quantityRequested, remarks } = item;

            const boqItem = await TestBoqItem.findById(boqItemId);
            if (!boqItem) {
                return res.status(404).json({ message: `BoQ item ${boqItemId} not found` });
            }

            // Total already requested (across all requisitions)
            const existingRequisitions = await MaterialRequisition.aggregate([
                { $unwind: "$items" },
                { $match: { "items.boqItemId": boqItem._id } },
                { $group: { _id: null, total: { $sum: "$items.quantityRequested" } } }
            ]);
            const alreadyRequested = existingRequisitions[0]?.total || 0;
            const remainingQty = boqItem.quantity - alreadyRequested;

            if (quantityRequested > remainingQty) {
                return res.status(400).json({
                    message: `Requested quantity for '${boqItem.itemName}' exceeds available (${remainingQty})`
                });
            }

            validatedItems.push({
                boqItemId,
                quantityRequested,
                quantityRemaining: quantityRequested,
                remarks
            });
        }

        // Append new items
        requisition.items.push(...validatedItems);
        await requisition.save();

        res.status(200).json({ message: "Items added successfully", requisition });
    } catch (error) {
        console.error("Error adding items:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = {
    createRequisition,
    getRequisitions,
    getRequisitionByNumber,
    updateRequisition,
    getAvailableItems,
    addItemsToRequisition
};
