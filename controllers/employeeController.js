const Employee = require('../models/Employee');
const User = require('../models/User');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const getPersonalDetails = async (req, res) => {
  try {
    const details = await Employee.findOne({ user: req.params.id });
    if (!details) return res.status(404).json({ message: 'Personal details not found' });
    res.status(200).json(details);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching details' });
  }
};

const getAllEmp = async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
};

const createPersonalDetails = async (req, res) => {
  try {
    const details = new Employee({
      user: req.params.id,
      ...req.body
    });

    await details.save();
    res.status(201).json({ message: 'Personal details created', details });
  } catch (err) {
    res.status(500).json({ message: 'Error creating personal details', error: err.message });
  }
};

const updatePersonalDetails = async (req, res) => {
  try {
    const updated = await Employee.findOneAndUpdate(
      { user: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Details not found' });
    res.status(200).json({ message: 'Updated', updated });
  } catch (err) {
    res.status(500).json({ message: 'Error updating details' });
  }
};

const deletePersonalDetails = async (req, res) => {
  try {
    const deleted = await Employee.findOneAndDelete({ user: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Details not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting details' });
  }
};

const getMyPersonalDetails = async (req, res) => {
  try {
    const userId = req.user.userId; // this was set in authenticate middleware
    const details = await Employee.findOne({ user: userId });

    if (!details) {
      return res.status(404).json({ message: 'No personal details found' });
    }

    res.status(200).json(details);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getBirthdayThisYear = (dob, year = new Date().getFullYear()) => {
  return new Date(year, dob.getMonth(), dob.getDate());
};

const getSortedBirthdays = async (req, res) => {
  try {
    const today = new Date();
    const allEmployees = await Employee.find({});

    const upcoming = [];
    const recent = [];

    allEmployees.forEach(emp => {
      const dob = new Date(emp.dob);
      let thisYearBirthday = getBirthdayThisYear(dob);
      const daysDiff = Math.floor((thisYearBirthday - today) / (1000 * 60 * 60 * 24));

      const birthdayData = {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        dob: emp.dob,
        department: emp.department,
        designation: emp.designation,
        birthdayThisYear: thisYearBirthday,
        daysFromToday: daysDiff
      };

      if (daysDiff >= 0 && daysDiff <= 60) {
        upcoming.push(birthdayData);
      } else if (daysDiff < 0 && daysDiff >= -60) {
        birthdayData.daysFromToday = daysDiff; // already negative
        recent.push(birthdayData);
      }
    });

    // Sort lists
    upcoming.sort((a, b) => a.daysFromToday - b.daysFromToday);
    recent.sort((a, b) => b.daysFromToday - a.daysFromToday);

    res.json({ upcoming, recent });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  getAllUsers,
  getPersonalDetails,
  createPersonalDetails,
  updatePersonalDetails,
  deletePersonalDetails,
  getMyPersonalDetails,
  getAllEmp,
  getSortedBirthdays
};