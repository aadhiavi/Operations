const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, approveRejectLeave, getLeaveDetails } = require('../controllers/leaveController');

router.post('/leave/:id', authenticate, applyLeave);
router.get('/leave/mine/:id', authenticate, getMyLeaves);
router.get('/leave/all', authenticate, isAdmin, getAllLeaves);
router.get('/leave/:id/personal', authenticate, isAdmin, getLeaveDetails)
router.put('/leave/:id', authenticate, isAdmin, updateLeaveStatus);
router.put('/leave/approve-reject/:id', authenticate, isAdmin, approveRejectLeave);


module.exports = router;
