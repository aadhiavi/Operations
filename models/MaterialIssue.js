const mongoose = require('mongoose');
const materialIssueSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    boqItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'BoqItem' },
    issuedQuantity: Number,
    issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    issueDate: { type: Date, default: Date.now },
    remarks: String
}, { timestamps: true });

module.exports = mongoose.model('MaterialIssue', materialIssueSchema);