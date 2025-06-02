const Salary = require('../models/Salary');
const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const getSalaryDetails = async (req, res) => {
  try {
    const salaryDetails = await Salary.find({ user: req.params.id }).populate('user', 'name tradeId');
    if (!salaryDetails) return res.status(404).json({ message: 'Salary details not found' });
    res.status(200).json(salaryDetails);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching details' });
  }
};

const createSalaryDetails = async (req, res) => {
  try {
    const { tradeId,name, amount, month, year, payoutDate } = req.body;
    const existing = await Salary.findOne({ user: req.params.id, month, year });
    if (existing) {
      return res.status(409).json({ message: 'Salary for this period already exists' });
    }
    const salaryDetails = new Salary({
      user: req.params.id,
      tradeId,
      name,
      amount,
      month,
      year,
      payoutDate
    });
    await salaryDetails.save();
    res.status(201).json({ message: 'Salary created', salaryDetails });
  } catch (err) {
    res.status(500).json({ message: 'Error creating details' });
  }
};

const updateSalaryDetails = async (req, res) => {
  try {
    const updated = await Salary.findOneAndUpdate(
      { user: req.params.id, month: req.body.month, year: req.body.year },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Salary not found' });
    res.status(200).json({ message: 'Updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating details' });
  }
};

// const deletePersonalDetails = async (req, res) => {
//   try {
//     const deleted = await Employee.findOneAndDelete({ user: req.params.id });
//     if (!deleted) return res.status(404).json({ message: 'Details not found' });
//     res.status(200).json({ message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting details' });
//   }
// };

const getAllSalary = async (req, res) => {
  try {
    const salaries = await Salary.find().populate('user', 'name tradeId');
    res.status(200).json(salaries);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all salary' });
  }
};

const getMySalaryDetails = async (req, res) => {
  try {
    const details = await Salary.find({ user: req.params.id });

    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'No salary details found' });
    }

    res.status(200).json(details); // Now returns an array
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  getAllUsers,
  getSalaryDetails,
  createSalaryDetails,
  updateSalaryDetails,
  getMySalaryDetails,
  getAllSalary
};
