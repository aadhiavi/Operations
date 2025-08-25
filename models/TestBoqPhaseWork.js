const mongoose = require("mongoose");

const testBoqPhaseWorkSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "TestBoqProject", required: true },
    phaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestProjectPhase', required: true },
    plannedStartDate: { type: Date },
    plannedEndDate: { type: Date },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
    workName: { type: String, required: true },
    description: String,
    status: {
        type: String,
        enum: ["Pending", "In-Progress", "Completed"],
        default: "Pending"
    },
    remarks: { type: String, default: "" }
}, { timestamps: true });

const TestBoqPhaseWork = mongoose.model("TestBoqPhaseWork", testBoqPhaseWorkSchema);
module.exports = TestBoqPhaseWork;