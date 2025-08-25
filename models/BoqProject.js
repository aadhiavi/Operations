const mongoose = require("mongoose");

// Material
const boqMaterialSchema = new mongoose.Schema({
  itemCode: { type: String },
  itemName: { type: String, required: true },
  description: { type: String },
  unit: { type: String, required: true },
  originalQuantity: { type: Number, required: true },
  actualQuantity: { type: Number, default: 0 },
  unitRate: { type: Number, required: true },
  totalCost: { type: Number, default: 0 },
  remarks: { type: String }
});

//total cost 
boqMaterialSchema.pre("save", function (next) {
  this.totalCost = this.actualQuantity * this.unitRate;
  next();
}); 

// Work/Task
const boqWorkSchema = new mongoose.Schema({
  workName: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In-progress", "Completed"],
    default: "Pending"
  }
});

// Phase
const boqPhaseSchema = new mongoose.Schema({
  phaseName: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  works: [boqWorkSchema],
  materials: [boqMaterialSchema]
});

// Main Project
const boqProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  clientName: { type: String },
  location: { type: String },
  phases: [boqPhaseSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

boqProjectSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const BoqProject = mongoose.model("BoqProject", boqProjectSchema);
module.exports = BoqProject;