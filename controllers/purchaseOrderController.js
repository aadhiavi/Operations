const MaterialMaster = require("../models/materialMaster");
const PurchaseOrder = require("../models/PurchaseOrder");
const Supplier = require("../models/Supplier");

//create po
const createPurchaseOrder = async (req, res) => {
    try { 
        const { poNumber } = req.body;
        const existingPO = await PurchaseOrder.findOne({ poNumber });
        if (existingPO) {
            return res.status(400).json({ error: "PO number already exists" });
        }

        const po = new PurchaseOrder(req.body);
        // Save PO to trigger calculations
        const saved = await po.save();

        //create the vendor from the PO
        let supplier = await Supplier.findOne({ GSTNo: saved.vendor.GSTNo });

        if (!supplier) {
            supplier = new Supplier({
                supplierName: saved.vendor.supplierName,
                address: saved.vendor.address,
                phoneNumber: saved.vendor.phone,
                GSTNo: saved.vendor.GSTNo,
                supplierEmail: saved.vendor.supplierEmail
            });
            await supplier.save();
        }

        for (const item of saved.items) {
            const existingItem = await MaterialMaster.findOne({
                itemName: item.itemName,
                category: item.category,
                subCategory: item.subCategory,
                hsnCode: item.hsnCode,
                make: item.make,
                price: item.price,
            });

            if (!existingItem) {
                const newMaterial = new MaterialMaster({
                    itemName: item.itemName,
                    price: item.price,
                    gstSlab: item.gstSlab,
                    category: item.category,
                    subCategory: item.subCategory,
                    hsnCode: item.hsnCode,
                    stockUnit: item.stockUnit,
                    make: item.make,
                    vendor: supplier._id // Link the vendor here
                });

                await newMaterial.save();
            }
        }

        res.status(201).json({ message: "Successfully created purchase order", saved });

    } catch (err) {
        console.error("Error creating purchase order:", err);
        res.status(400).json({ error: err.message });
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

module.exports = { createPurchaseOrder, getAllPurchaseOrders, getPurchaseOrderById, updatePurchaseOrder, deletePurchaseOrder, getAllPurchaseOrdersStageWise }