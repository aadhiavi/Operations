const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    purchaseOrderNo: { type: String },
    deliveryDate: { type: Date },
    project: { type: String },
    deliveryNoteNumber: { type: String },
    deliveredItems: [
        {
            boqItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestBoqItem', required: true },
            itemName: { type: String },
            category: { type: String },
            quantity: { type: Number, required: true },
            actualReceivedQuantity: { type: Number },
        }
    ],
    receivedBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String }
    },
    inspectionStatus: {
        type: String,
        enum: ['Pending', 'Passed', 'Failed'],
        default: 'Pending'
    },
    inspectionRemarks: String
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
module.exports = Delivery;

