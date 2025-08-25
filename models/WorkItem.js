const mongoose = require("mongoose");

const WorkItemSchema = new mongoose.Schema({
    workDescription: { type: String, required: true },
    quantity: { type: Number, default: 0 },
    unitName: { type: String, default: '' },
    rate: { type: Number, required: true },
}, { timestamps: true });


module.exports = mongoose.model('WorkItem', WorkItemSchema);

