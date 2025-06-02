const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  tradeId: String,
  name: String,
  department: String,
  designation: String,
  doj: Date,
  email: String,
  gender: String,
  dob: Date,
  mobile: String,
  pan: String,
  aadhaar: String,
  bloodGroup: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  bankName: String,
  branch: String,
  accountNo: String,
  ifscCode: String,
  kinName: String,
  relationship: String,
  kinAddress: String,
  kinPhone: String,
  employeeSignature: String,
  annualSalary: String,
});
const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;


