const mongoose = require("mongoose");

const testBoqProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    clientName: String,
    location: String
}, { timestamps: true });

const TestBoqProject = mongoose.model("TestBoqProject", testBoqProjectSchema);
module.exports = TestBoqProject;

