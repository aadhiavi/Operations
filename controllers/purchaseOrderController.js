const MaterialMaster = require("../models/materialMaster");
const MaterialRequisition = require("../models/MaterialRequisition");
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");

//create po
// const createPurchaseOrder = async (req, res) => {
//     try { 
//         const { poNumber } = req.body;
//         const existingPO = await PurchaseOrder.findOne({ poNumber });
//         if (existingPO) {
//             return res.status(400).json({ error: "PO number already exists" });
//         }

//         const po = new PurchaseOrder(req.body);
//         // Save PO to trigger calculations
//         const saved = await po.save();

//         //create the vendor from the PO
//         let supplier = await Supplier.findOne({ GSTNo: saved.vendor.GSTNo });

//         if (!supplier) {
//             supplier = new Supplier({
//                 supplierName: saved.vendor.supplierName,
//                 address: saved.vendor.address,
//                 phoneNumber: saved.vendor.phone,
//                 GSTNo: saved.vendor.GSTNo,
//                 supplierEmail: saved.vendor.supplierEmail
//             });
//             await supplier.save();
//         }

//         for (const item of saved.items) {
//             const existingItem = await MaterialMaster.findOne({
//                 itemName: item.itemName,
//                 category: item.category,
//                 subCategory: item.subCategory,
//                 hsnCode: item.hsnCode,
//                 make: item.make,
//                 price: item.price,
//             });

//             if (!existingItem) {
//                 const newMaterial = new MaterialMaster({
//                     itemName: item.itemName,
//                     price: item.price,
//                     gstSlab: item.gstSlab,
//                     category: item.category,
//                     subCategory: item.subCategory,
//                     hsnCode: item.hsnCode,
//                     stockUnit: item.stockUnit,
//                     make: item.make,
//                     vendor: supplier._id // Link the vendor here
//                 });

//                 await newMaterial.save();
//             }
//         }

//         res.status(201).json({ message: "Successfully created purchase order", saved });

//     } catch (err) {
//         console.error("Error creating purchase order:", err);
//         res.status(400).json({ error: err.message });
//     }
// };

// const createPurchaseOrder = async (req, res) => {
//     try {
//         const {
//             poNumber,
//             requisition,
//             vendor,
//             items,
//             company,
//             deliveryDate,
//             billingAddress,
//             shippingAddress,
//             additionalCharges,
//             paymentTerms,
//             deliveryTerms,
//             transportation,
//             specialNote,
//             createdBy
//         } = req.body;

//         // Check PO number uniqueness
//         const existingPO = await PurchaseOrder.findOne({ poNumber });
//         if (existingPO) {
//             return res.status(400).json({ error: "PO number already exists" });
//         }

//         // Fetch Requisition
//         const requisitionData = await MaterialRequisition.findOne({ number: requisition.number });
//         if (!requisitionData) {
//             return res.status(404).json({ error: "Requisition not found" });
//         }

//         // Create map of requested quantities
//         const requestedQuantities = {};
//         for (const item of requisitionData.items) {
//             requestedQuantities[item.boqItemId.toString()] = item.quantityRequested;
//         }

//         // Validate PO items
//         for (const item of items) {
//             const boqId = item.boqItemId?.toString();
//             if (!boqId || !requestedQuantities[boqId]) {
//                 return res.status(400).json({
//                     error: `Invalid or missing BOQ item ID for item "${item.itemName}"`
//                 });
//             }
//             if (item.quantity > requestedQuantities[boqId]) {
//                 return res.status(400).json({
//                     error: `Ordered quantity for item "${item.itemName}" (${item.quantity}) exceeds requested quantity (${requestedQuantities[boqId]})`
//                 });
//             }
//         }

//         if (!company || !company.gstin) {
//             return res.status(400).json({ error: "Company GSTIN is required for GST calculation" });
//         }

//         if (!Array.isArray(items) || items.length === 0) {
//             return res.status(400).json({ error: "Items are required in the purchase order" });
//         }

//         for (const item of items) {
//             if (
//                 typeof item.price !== 'number' ||
//                 typeof item.quantity !== 'number' ||
//                 !item.gstSlab
//             ) {
//                 return res.status(400).json({ error: `Missing required item fields (price, quantity, gstSlab)` });
//             }
//         }


//         // Create and save PO
//         const newPO = new PurchaseOrder({
//             poNumber,
//             requisition: {
//                 number: requisition.number,
//                 _id: requisitionData._id
//             },
//             company,
//             vendor,
//             items,
//             deliveryDate,
//             billingAddress,
//             shippingAddress,
//             additionalCharges,
//             paymentTerms,
//             deliveryTerms,
//             transportation,
//             specialNote,
//             createdBy,
//             createdAt: new Date()
//         });

//         const saved = await newPO.save();


//         // Handle Vendor Entry (Supplier)
//         let supplier = await Supplier.findOne({ GSTNo: vendor.GSTNo });
//         if (!supplier) {
//             supplier = new Supplier({
//                 supplierName: vendor.supplierName,
//                 address: vendor.address,
//                 phoneNumber: vendor.phone,
//                 GSTNo: vendor.GSTNo,
//                 supplierEmail: vendor.supplierEmail
//             });
//             await supplier.save();
//         }

//         // Handle Material Master Entry
//         for (const item of items) {
//             const existingMaterial = await MaterialMaster.findOne({
//                 itemName: item.itemName,
//                 category: item.category,
//                 subCategory: item.subCategory,
//                 hsnCode: item.hsnCode,
//                 make: item.make,
//                 price: item.price
//             });

//             if (!existingMaterial) {
//                 const newMaterial = new MaterialMaster({
//                     itemName: item.itemName,
//                     price: item.price,
//                     gstSlab: item.gstSlab,
//                     category: item.category,
//                     subCategory: item.subCategory,
//                     hsnCode: item.hsnCode,
//                     stockUnit: item.stockUnit,
//                     make: item.make,
//                     vendor: supplier._id
//                 });
//                 await newMaterial.save();
//             }
//         }

//         res.status(201).json({ message: "Successfully created purchase order", saved });

//     } catch (err) {
//         console.error("Error creating purchase order:", err);
//         res.status(400).json({ error: err.message });
//     }
// };

const createPurchaseOrder = async (req, res) => {
    try {
        const {
            poNumber,
            requisition,
            vendor,
            items,
            company,
            deliveryDate,
            billingAddress,
            shippingAddress,
            additionalCharges,
            paymentTerms,
            deliveryTerms,
            transportation,
            specialNote,
            createdBy
        } = req.body;

        const existingPO = await PurchaseOrder.findOne({ poNumber });
        if (existingPO) {
            return res.status(400).json({ error: "PO number already exists" });
        }

        const requisitionDoc = await MaterialRequisition.findOne({ number: requisition.number });
        if (!requisitionDoc) {
            return res.status(404).json({ error: "Requisition not found" });
        }

        // Track quantities for validation
        // Build requisitionItemMap with _id for requisitionItemId
        const requisitionItemMap = {};
        requisitionDoc.items.forEach(item => {
            const boqId = item.boqItemId.toString();
            requisitionItemMap[boqId] = {
                _id: item._id,
                quantityRequested: item.quantityRequested,
                quantityRemaining: item.quantityRemaining ?? item.quantityRequested
            };
        });

        // Validate and update remaining quantities
        for (const item of items) {
            const boqId = item.boqItemId?.toString();
            if (!boqId || !requisitionItemMap[boqId]) {
                return res.status(400).json({ error: `Invalid or missing BOQ item for ${item.itemName}` });
            }

            const remaining = requisitionItemMap[boqId].quantityRemaining;
            if (item.quantity > remaining) {
                return res.status(400).json({
                    error: `Ordered quantity (${item.quantity}) exceeds remaining (${remaining}) for ${item.itemName}`
                });
            }

            // Subtract ordered quantity
            requisitionItemMap[boqId].quantityRemaining -= item.quantity;
        }

        // Update requisition document quantitiesRemaining
        requisitionDoc.items = requisitionDoc.items.map(item => {
            const boqId = item.boqItemId.toString();
            if (requisitionItemMap[boqId]) {
                item.quantityRemaining = requisitionItemMap[boqId].quantityRemaining;
            }
            return item;
        });

        await requisitionDoc.save();

        // Build PO items array with requisitionItemId included
        const poItems = items.map(item => {
            const boqId = item.boqItemId.toString();
            return {
                ...item,
                boqItemId: item.boqItemId,
                requisitionItemId: requisitionItemMap[boqId]._id,
            };
        });

        // Save PO with poItems
        const newPO = new PurchaseOrder({
            poNumber,
            requisition: {
                number: requisition.number,
                _id: requisitionDoc._id
            },
            company,
            vendor,
            items: poItems,
            deliveryDate,
            billingAddress,
            shippingAddress,
            additionalCharges,
            paymentTerms,
            deliveryTerms,
            transportation,
            specialNote,
            createdBy,
            createdAt: new Date()
        });

        const savedPO = await newPO.save();

        // Save Supplier if not exists
        let supplier = await Supplier.findOne({ GSTNo: vendor.GSTNo });
        if (!supplier) {
            supplier = new Supplier({
                supplierName: vendor.supplierName,
                address: vendor.address,
                phoneNumber: vendor.phone,
                GSTNo: vendor.GSTNo,
                supplierEmail: vendor.supplierEmail
            });
            await supplier.save();
        }

        // Save Materials if not exists
        for (const item of items) {
            const existingMaterial = await MaterialMaster.findOne({
                itemName: item.itemName,
                category: item.category,
                subCategory: item.subCategory,
                hsnCode: item.hsnCode,
                make: item.make
            });

            if (!existingMaterial) {
                const newMaterial = new MaterialMaster({
                    itemName: item.itemName,
                    price: item.price,
                    gstSlab: item.gstSlab,
                    category: item.category,
                    subCategory: item.subCategory,
                    hsnCode: item.hsnCode,
                    stockUnit: item.stockUnit,
                    make: item.make,
                    vendor: supplier._id
                });
                await newMaterial.save();
            }
        }

        res.status(201).json({ message: "Purchase Order created", saved: savedPO });

    } catch (err) {
        console.error("Error creating purchase order:", err);
        res.status(500).json({ error: err.message });
    }
};

const withdrawPurchaseOrder = async (req, res) => {
    try {
        const { poId } = req.params;

        const po = await PurchaseOrder.findById(poId);
        if (!po) {
            return res.status(404).json({ message: "Purchase Order not found" });
        }

        // Get the associated requisition
        const requisition = await MaterialRequisition.findById(po.requisition._id);
        if (!requisition) {
            return res.status(404).json({ message: "Associated requisition not found" });
        }

        // Create a map of BOQ item quantities in the PO (using string keys)
        const poItemsMap = {};
        for (const item of po.items) {
            const boqId = item.boqItemId?.toString(); // 🔑 Convert to string
            if (!boqId) continue;
            poItemsMap[boqId] = (poItemsMap[boqId] || 0) + item.quantity;
        }

        // Add quantities back to requisition items
        for (const item of requisition.items) {
            const boqId = item.boqItemId?.toString(); // 🔑 Convert to string
            if (poItemsMap[boqId]) {
                item.quantityRemaining += poItemsMap[boqId];
            }
        }

        // Save updated requisition
        await requisition.save();

        // Delete the PO
        await PurchaseOrder.findByIdAndDelete(poId);
        console.log("PO Item Map:", poItemsMap);
        console.log("Requisition Items:", requisition.items.map(i => ({
            boqItemId: i.boqItemId.toString(),
            quantityRemaining: i.quantityRemaining
        })));


        res.status(200).json({ message: "PO withdrawn and requisition updated" });

    } catch (error) {
        console.error("Error withdrawing PO:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// const updateRequisition = async (req, res) => {
//     const { number } = req.params;
//     const { items } = req.body;
//     try {
//         const requisition = await MaterialRequisition.findOne({ number });
//         if (!requisition) {
//             return res.status(404).json({ message: "Requisition not found" });
//         }
//         requisition.items = items;
//         await requisition.save();
//         return res.status(200).json({ message: "Requisition updated successfully", requisition });
//     } catch (error) {
//         console.error("Error updating requisition:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

const getPurchaseOrders = async (req, res) => {
    try {
        const purchaseOrders = await PurchaseOrder.find()
            .populate("requisition._id", "number projectId phaseId items")
            .populate("requisition._id.projectId", "name")
            .populate("requisition._id.phaseId", "phaseName")
            .populate("items.boqItemId", "itemCode itemName unit");

        res.status(200).json(purchaseOrders);
    } catch (err) {
        console.error("Error fetching POs:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get All POs
const getAllPurchaseOrders = async (req, res) => {
    try {
        const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
        res.status(200).json(pos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getAllPurchaseOrdersStageWise = async (req, res) => {
    const { period } = req.query;

    const currentDate = new Date();
    let startDate;

    if (period === "last7days") {
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        try {
            const transactionsByDay = [];

            for (let i = 0; i < 7; i++) {
                const dayStart = new Date(startDate);
                dayStart.setDate(startDate.getDate() + i);

                const dayEnd = new Date(dayStart);
                dayEnd.setDate(dayStart.getDate() + 1);

                const dailyTransactions = await PurchaseOrder.find({
                    createdAt: { $gte: dayStart, $lt: dayEnd }
                });

                const total = dailyTransactions.reduce((sum, po) => sum + po.grandTotal, 0);

                transactionsByDay.push({
                    date: dayStart.toDateString(),
                    transactions: dailyTransactions,
                    totalAmount: total
                });
            }

            return res.json({ transactions: transactionsByDay });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching POs", error });
        }

    } else if (period === "yesterday") {
        startDate = new Date();
        startDate.setDate(currentDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        try {
            const transactions = await PurchaseOrder.find({
                createdAt: { $gte: startDate, $lt: endDate }
            });

            const totalAmount = transactions.reduce((acc, po) => acc + po.grandTotal, 0);
            return res.json({ transactions, totalAmount });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching POs", error });
        }

    } else if (period === "last7weeks") {
        try {
            const transactionsByWeek = [];

            for (let i = 6; i >= 0; i--) {
                const weekStart = new Date();
                weekStart.setDate(currentDate.getDate() - currentDate.getDay() - (i * 7));
                weekStart.setHours(0, 0, 0, 0);

                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);

                const weeklyTransactions = await PurchaseOrder.find({
                    createdAt: { $gte: weekStart, $lt: weekEnd }
                });

                const totalWeeklyAmount = weeklyTransactions.reduce((acc, po) => acc + po.grandTotal, 0);

                transactionsByWeek.push({
                    week: `${weekStart.toLocaleDateString()} - ${new Date(weekEnd - 1).toLocaleDateString()}`,
                    transactions: weeklyTransactions,
                    totalAmount: totalWeeklyAmount
                });
            }

            return res.json({ transactions: transactionsByWeek });

        } catch (error) {
            return res.status(500).json({ message: "Error fetching POs", error });
        }

    } else if (period === "last7months") {
        try {
            const transactionsByMonth = [];

            for (let i = 6; i >= 0; i--) {
                const monthStart = new Date(currentDate);
                monthStart.setMonth(currentDate.getMonth() - i, 1);
                monthStart.setHours(0, 0, 0, 0);

                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthStart.getMonth() + 1);

                const monthlyTransactions = await PurchaseOrder.find({
                    createdAt: { $gte: monthStart, $lt: monthEnd }
                });

                const totalMonthlyAmount = monthlyTransactions.reduce((acc, po) => acc + po.grandTotal, 0);

                transactionsByMonth.push({
                    month: monthStart.toLocaleString('default', { month: 'long', year: 'numeric' }),
                    transactions: monthlyTransactions,
                    totalAmount: totalMonthlyAmount
                });
            }

            return res.json({ transactions: transactionsByMonth });

        } catch (error) {
            return res.status(500).json({ message: "Error fetching POs", error });
        }

    } else {
        return res.status(400).json({
            message: "Invalid period. Use 'last7days', 'yesterday', 'last7weeks', or 'last7months'."
        });
    }
};

// Get Single PO by ID
const getPurchaseOrderById = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id);
        if (!po) return res.status(404).json({ error: 'Purchase Order not found' });
        res.json(po);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//get by po number
const getPurchaseOrderByPoNumber = async (req, res) => {
    try {
        const { poNumber } = req.params;
        const po = await PurchaseOrder.findOne({ poNumber });
        if (!po) return res.status(404).json({ error: 'Purchase Order not found' });
        res.json(po);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update PO by ID
const updatePurchaseOrder = async (req, res) => {
    try {
        const updated = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updated) return res.status(404).json({ error: 'Purchase Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete PO by ID
const deletePurchaseOrder = async (req, res) => {
    try {
        const deleted = await PurchaseOrder.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Purchase Order not found' });
        res.json({ message: 'Purchase Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createPurchaseOrder,
    getAllPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getAllPurchaseOrdersStageWise,
    getPurchaseOrders,
    withdrawPurchaseOrder,
    getPurchaseOrderByPoNumber
}