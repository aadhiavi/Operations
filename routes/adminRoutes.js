const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { getMyPersonalDetails, getAllUsers, getPersonalDetails, createPersonalDetails, updatePersonalDetails, deletePersonalDetails, getAllEmp, getSortedBirthdays } = require('../controllers/employeeController');

router.get('/users', authenticate, isAdmin, getAllUsers);
router.get('/user/:id/personal', authenticate, isAdmin, getPersonalDetails);
router.post('/user/:id/personal', authenticate, isAdmin, createPersonalDetails);
router.put('/user/:id/personal', authenticate, isAdmin, updatePersonalDetails);
router.delete('/user/:id/personal', authenticate, isAdmin, deletePersonalDetails);
router.get('/me/personal', authenticate, getMyPersonalDetails);
router.get('/all-employees', authenticate, isAdmin, getAllEmp);
router.get('/birthdays', getSortedBirthdays);

module.exports = router;
