const mongoose = require('mongoose');

const salaryFixedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tradeId: { type: String, required: true },
  name: { type: String, required: true },

  basicMonthly: Number,
  hraMonthly: Number,
  caMonthly: Number,
  maMonthly: Number,
  saMonthly: Number,
  grossMonthly: Number,
  bonusMonthly: Number,

  employeePFMonthly: Number,
  employerPFMonthly: Number,
  esiEmployee: Number,
  esiEmployer: Number,
  taxMonthly: Number,
  otherDed: Number,
  inHandMonthly: Number,

  annualCTC: Number,
  annualGross: Number,
  annualInHand: Number,
  annualBonus: Number,
  annualEmployerPF: Number
}, { timestamps: true });

const SalaryFixed = mongoose.model('SalaryFixed', salaryFixedSchema);
module.exports = SalaryFixed;

