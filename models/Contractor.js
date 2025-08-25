const mongoose = require('mongoose');

const ContractorSchema = new mongoose.Schema({
    contractorName: { type: String, required: true },
    contactNumber: { type: String },
    workItems: [{
        workItem: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkItem', required: true },
        status: {
            type: String,
            enum: ['active','closed','Cancelled', ],
            default: 'active'
        },
        contractDate: { type: Date, default: Date.now }
    }],
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'TestBoqProject', required: true }
});

const Contractor = mongoose.model('Contractor', ContractorSchema);
module.exports = Contractor
