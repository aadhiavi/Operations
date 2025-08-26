const mongoose = require('mongoose');

const payrollModelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    tradeId: {
        type: String,
    },
    month: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    grossMonthly: {
        type: Number,
        default: 0,
    },
    present: {
        type: Number,
        default: 0,
    },
    absent: {
        type: Number,
        default: 0,
    },
    sundays: {
        type: Number,
        default: 0,
    },
    holidays: {
        type: Number,
        default: 0,
    },
    allowedLeaves: {
        type: Number,
        default: 0,
    },
    workingDays: {
        type: Number,
        default: 0,
    },
    payableDays: {
        type: Number,
        default: 0,
    },
    totalDays: {
        type: Number,
        default: 0,
    },
    deduction: {
        type: Number,
        default: 0,
    },
    finalSalary: {
        type: Number,
        default: 0,
    },
    workedHours: {
        type: Number,
        default: 0,
    },
    actualHours: {
        type: Number,
        default: 0,
    },
    isDraft: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
});

payrollModelSchema.index({ userId: 1, month: 1, year: 1, isDraft: 1 }, { unique: true });

const PayrollModel = mongoose.model('PayrollModel', payrollModelSchema);
module.exports = PayrollModel;