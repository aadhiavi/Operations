const mongoose = require('mongoose');

const manpowerSchema = new mongoose.Schema({
  category: { type: String },
  description: { type: String },
  count: { type: Number, min: 0 },
  baseLong: { type: Number },
  typeOfCount: { type: String },
  baseFare: { type: Number },
  cost: { type: Number },
  quantity: { type: Number },
  extraHours: { type: Number }
});

const machinerySchema = new mongoose.Schema({
  name: { type: String },
  usageHours: { type: Number },
  ratePerHour: { type: Number },
  typeOfMeasure: { type: String },
  cost: { type: Number }
});

const materialSchema = new mongoose.Schema({
  name: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  ratePerUnit: { type: Number },
  cost: { type: Number }
})

const wastageSchema = new mongoose.Schema({
  item: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  cost: { type: Number }
})

const otherSchema = new mongoose.Schema({
  itemType: { type: String },
  description: { type: String },
  cost: { type: Number }
})

const practiceReportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "TestBoqProject", required: true },
  date: Date,
  manpower: [manpowerSchema],
  machinery: [machinerySchema],
  material: [materialSchema],
  wastage: [wastageSchema],
  other: [otherSchema],
  totalCost: { type: Number },
  remarks: { type: String }
}, { timestamps: true });

const PracticeReport = mongoose.model('PracticeReport', practiceReportSchema);
module.exports = PracticeReport;

