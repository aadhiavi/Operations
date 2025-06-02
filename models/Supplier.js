const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema({
    supplierName: { type: String },
    address: { type: String },
    phoneNumber: { type: String },
    GSTNo: { type: String },
    supplierEmail: { type: String },
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", supplierSchema);
module.exports = Supplier;