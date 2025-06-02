const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { getAllUsers, getSalaryDetails, createSalaryDetails, updateSalaryDetails, getMySalaryDetails, getAllSalary } = require('../controllers/salaryController');

router.get('/salary', authenticate, isAdmin, getAllUsers);
router.get('/salary/:id/personal', authenticate, isAdmin, getSalaryDetails);
router.post('/salary/:id/personal', authenticate, isAdmin, createSalaryDetails);
router.put('/salary/:id/personal', authenticate, isAdmin, updateSalaryDetails);
router.get('/me/salary/:id', authenticate, getMySalaryDetails);
router.get('/all-salary', authenticate, isAdmin, getAllSalary);

module.exports = router;

