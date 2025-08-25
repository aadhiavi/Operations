const mongoose = require("mongoose");

const boqWorkSchema = new mongoose.Schema({
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


const TestProjectPhaseSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "TestBoqProject", required: true },
    phaseName: { type: String, required: true },
    startDate: Date,
    endDate: Date,
    description: String,
    works: [boqWorkSchema]
}, { timestamps: true });

const TestProjectPhase = mongoose.model("TestProjectPhase", TestProjectPhaseSchema);
module.exports = TestProjectPhase;