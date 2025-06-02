const mongoose = require('mongoose');

// Utility to extract GST state code
function getStateCode(gstin) {
    return gstin?.substring(0, 2);
}

const PurchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String },

    // Company Info
    company: {
        name: { type: String },
        gstin: { type: String },
        project: { type: String },
    },

    // Requisition Reference
    requisition: {
        number: { type: String },
        date: { type: Date }
    },

    // Vendor Info
    vendor: {
        supplierName: { type: String, required: true },
        address: { type: String },
        GSTNo: { type: String },
        phone: { type: String },
        supplierEmail: { type: String },
    },

    deliveryDate: { type: String },

    // Addresses
    billingAddress: { type: String },
    shippingAddress: {
        shippingAddress: { type: String },
        receiverName: { type: String },
        receiverPhone: { type: String },
        vehicleNumber: { type: String },
        placeOfDelivery: { type: String },
    },

    // Items Ordered
    items: [
        {
            itemName: { type: String },
            category: { type: String },
            subCategory: { type: String },
            make: { type: String },
            hsnCode: { type: String },
            stockUnit: { type: String },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            discountPercent: { type: Number },
            discountAmount: { type: Number },
            taxableAmount: { type: Number },
            gstSlab: { type: String },
            gstAmount: { type: Number },
            total: { type: Number },
        }
    ],
    additionalCharges: [
        {
            description: { type: String },
            amount: { type: Number }
        }
    ],

    // GST Type: IGST or CGST+SGST
    gstType: { type: String, enum: ['IGST', 'CGST_SGST'], required: false },

    // GST Splits
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },

    //Totals
    subtotal: { type: Number, required: true },
    gstAdd: { type: Number, default: 0 },
    gstMinus: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    amountInWords: { type: String },

    // Payment & Delivery Terms
    paymentTerms: { type: String },
    deliveryTerms: { type: String },
    transportation: { type: String },

    // Notes
    specialNote: { type: String },

    // Metadata
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});


PurchaseOrderSchema.pre('save', function (next) {
    const buyerState = getStateCode(this.company?.gstin);
    const supplierState = getStateCode(this.vendor?.GSTNo);

    this.gstType = buyerState === supplierState ? 'CGST_SGST' : 'IGST';

    let subtotal = 0;
    let cgst = 0, sgst = 0, igst = 0;

    this.items.forEach(item => {
        const baseAmount = item.price * item.quantity;

        let discountAmount = 0;

        if (typeof item.discountPercent === 'number' && !isNaN(item.discountPercent)) {
            discountAmount = (baseAmount * item.discountPercent) / 100;
            item.discountAmount = discountAmount;
        } else if (typeof item.discountAmount === 'number' && !isNaN(item.discountAmount)) {
            discountAmount = item.discountAmount;
        } else {
            discountAmount = 0;
        }

        const taxableAmount = baseAmount - discountAmount;

        const gstRate = parseFloat(item.gstSlab?.replace('%', '')) || 0;
        const gstAmount = (taxableAmount * gstRate) / 100;

        const total = taxableAmount + gstAmount;

        item.taxableAmount = taxableAmount;
        item.gstAmount = gstAmount;
        item.total = total;

        subtotal += taxableAmount;

        if (this.gstType === 'CGST_SGST') {
            cgst += gstAmount / 2;
            sgst += gstAmount / 2;
        } else {
            igst += gstAmount;
        }
    });

    this.subtotal = subtotal;
    this.cgstAmount = cgst;
    this.sgstAmount = sgst;
    this.igstAmount = igst;
    this.gstAdd = cgst + sgst + igst;
    this.grandTotal = subtotal + this.gstAdd;
    this.updatedAt = new Date();
    next();
});


const PurchaseOrder = mongoose.model('PurchaseOrder', PurchaseOrderSchema);
module.exports = PurchaseOrder;
