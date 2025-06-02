const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    id: { type: String, required: true },
    date: { type: String, required: true },
    in: { type: String, required: true },
    out: { type: String, required: true }
});

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;