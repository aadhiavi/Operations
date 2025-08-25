const mongoose = require('mongoose');

const MonthHolidaySchema = new mongoose.Schema({
    month: {
        type: String,
        enum: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        required: true
    },
    count: {
        type: Number,
        default: 0
    }
}, { _id: false });

const HolidayConfigSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    },
    holidays: {
        type: [MonthHolidaySchema],
        default: []
    }
});

const HolidayConfig = mongoose.model('HolidayConfig', HolidayConfigSchema);
module.exports = HolidayConfig 