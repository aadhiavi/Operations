const mongoose = require("mongoose")

const inventorySchema = new mongoose.Schema({
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    purchaseOrderNo: { type: String },
    deliveryDate: { type: Date },
    project: { type: String },
    categories: [
        {
            category: { type: String },
            categoryItems: [
                {
                    boqItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestBoqItem', required: true },
                    itemName: { type: String },
                    quantity: { type: Number, required: true },
                    isItemConfirmed: { type: Boolean, default: false },
                    isQuantityCorrect: { type: Boolean, default: true },
                    actualReceivedQuantity: { type: Number },
                }]
        },

    ],
    deliveryNoteNumber: String,
    receivedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String }
    }

}, { timestamps: true });
const Inventory = mongoose.model('Inventory', inventorySchema)
module.exports = Inventory;