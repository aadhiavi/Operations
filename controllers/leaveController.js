const Leave = require("../models/Leave");

const applyLeave = async (req, res) => {
  try {
    const {type, startDate, endDate, reason } = req.body;
    const userId = req.params.id;

    const leave = new Leave({ user: userId, type, startDate, endDate, reason });
    await leave.save();
    res.status(201).json({ message: 'Leave applied', leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error applying leave', error: err.message });
  }
};

const getMyLeaves = async (req, res) => {
  try {
    const userId = req.params.id;
    const leaves = await Leave.find({ user: userId }).sort({ startDate: -1 });
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave records' });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('user', 'name tradeId');
    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching all leaves' });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.status(200).json({ message: 'Leave updated', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave status' });
  }
};

const approveRejectLeave = async (req, res) => {
  try {
    const { status, rejectionNote } = req.body; // 'Approved' or 'Rejected'
    const validStatuses = ['Approved', 'Rejected'];

    // Validate the status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. It must be either "Approved" or "Rejected".' });
    }

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    // Check if the leave is already processed (approved/rejected)
    if (leave.status !== 'Pending') {
      return res.status(400).json({ message: 'Leave is already processed (approved/rejected).' });
    }

    // If rejected, save the rejection note
    if (status === 'Rejected' && rejectionNote) {
      leave.rejectionNote = rejectionNote;
    }

    // Update the status of the leave
    leave.status = status;
    await leave.save();

    res.status(200).json({ message: `Leave ${status} successfully`, leave });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating leave status', error: err.message });
  }
};

const getLeaveDetails = async (req, res) => {
  try {
    const leaveDetails = await Leave.find({ user: req.params.id })
      .populate('user', 'name tradeId');
    if (!leaveDetails || leaveDetails.length === 0) {
      return res.status(404).json({ message: 'Leave details not found' });
    }
    res.status(200).json(leaveDetails);
  } catch (err) {
    console.error('Error in getLeaveDetails:', err);
    res.status(500).json({ message: 'Error fetching details' });
  }
};


module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
  approveRejectLeave,
  getLeaveDetails
};
