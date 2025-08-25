const mongoose = require("mongoose");

const materialRequisitionSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestBoqProject', required: true },
    number: { type: String, required: true, unique: true },
    items: [{
        boqItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestBoqItem', required: true },
        quantityRequested: { type: Number, required: true },
        quantityRemaining: { type: Number, required: true },
        remarks: { type: String }
    }],
    status: {
        type: String,
        enum: ["Open", "Closed"],
        default: "Open"
    }
}, { timestamps: true });

const MaterialRequisition = mongoose.model("MaterialRequisition", materialRequisitionSchema);
module.exports = MaterialRequisition