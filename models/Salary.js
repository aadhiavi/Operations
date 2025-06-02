const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  tradeId: { type: String, required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String },
  year: { type: Number },
  payoutDate: { type: Date }
}, { timestamps: true });

const Salary = mongoose.model('Salary', salarySchema);
module.exports = Salary;





