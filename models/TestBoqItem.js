const mongoose = require("mongoose");
const testBoqItemSchema = new mongoose.Schema({
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestProjectPhase', required: true },
    itemCode: String,
    itemName: { type: String, required: true },
    unit: { type: String, required: true },
    quantity: { type: Number, required: true },
    remarks: String
}, { timestamps: true });

const TestBoqItem = mongoose.model("TestBoqItem", testBoqItemSchema);
module.exports = TestBoqItem

