const mongoose = require('mongoose');

const materialMasterSchema = new mongoose.Schema({
    itemName: { type: String },
    price: { type: Number },
    gstSlab: { type: String },
    category: { type: String },
    subCategory: { type: String },
    hsnCode: { type: String },
    stockUnit: { type: String },
    make: { type: String },
    itemCode: { type: String },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Supplier',
        required: false,
        default: null,
        set: (value) => (value === '' ? null : value)
    },
}, { timestamps: true });

const MaterialMaster = mongoose.model('MaterialMaster', materialMasterSchema);
module.exports = MaterialMaster;