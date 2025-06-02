const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Casual leave', 'Sick leave', 'Privilege leave', 'Earned leave'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionNote: { type: String, default: '' },
},{ timestamps: true });

const Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;


