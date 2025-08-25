const mongoose = require("mongoose");

const phaseWorkHistorySchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "TestBoqProject", required: true },
    phaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TestProjectPhase',
        required: true
    },
    workId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestBoqPhaseWork",
        required: true
    },
    date: Date,
    manpower: [{
        role: String,
        count: Number,
        ratePerHour: Number,
        hours: Number,
        cost: Number
    }],
    machinery: [{
        name: String,
        usageHours: Number,
        ratePerHour: Number,
        cost: Number
    }],
    materials: [{
        name: String,
        quantity: Number,
        unit: String,
        ratePerUnit: Number,
        cost: Number
    }],
    miscellaneous: [{
        itemType: String,
        description: String,
        cost: Number
    }],
    wastage: [{
        item: String,
        quantity: Number,
        unit: String,
        estimatedCost: Number
    }],
    notes: String,
    totalCost: Number,
    remarks: String
}, { timestamps: true });

const PhaseWorkHistory = mongoose.model("PhaseWorkHistory", phaseWorkHistorySchema);
module.exports = PhaseWorkHistory