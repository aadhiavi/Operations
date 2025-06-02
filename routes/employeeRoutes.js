// const express = require('express');
// const { getEmployees, addEmployee } = require('../controllers/employeeController');
// const { authenticate, verifyRole } = require('../middleware/auth');
// const router = express.Router();

// router.get('/', authenticate, getEmployees);
// router.post('/', authenticate, verifyRole(['admin']), addEmployee);

// module.exports = router;


const router = require('express').Router();
const auth = require('../middleware/auth');
const Employee = require('../models/Employee');

router.post('/', auth, async (req, res) => {
  const emp = new Employee(req.body);
  await emp.save();
  res.json(emp);
});

router.get('/', auth, async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

router.put('/:id', auth, async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(emp);
});

router.delete('/:id', auth, async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.send('Deleted');
});

module.exports = router;
