const Supplier = require("../models/Supplier");

const postSupplier = async (req, res) => {
    const { supplierName, address, phoneNumber, GSTNo, supplierEmail } = req.body;
    if (!supplierName || !address || !phoneNumber || !GSTNo || !supplierEmail) {
        return res.status(400).send('All fields are required');
    }
    try {
        const existingSupplier = await Supplier.findOne({
            $or: [
                { supplierName: supplierName },
                { GSTNo: GSTNo }
            ]
        });
        if (existingSupplier) {
            return res.status(409).send('Supplier already exists');
        }
        const newSupplier = new Supplier({
            supplierName,
            address,
            phoneNumber,
            GSTNo,
            supplierEmail
        });
        await newSupplier.save();
        res.status(201).json(newSupplier);
    } catch (error) {
        console.error('Error saving supplier:', error);
        res.status(500).send('Server error');
    }
};


const getSupplier = async (req, res) => {
    const { id } = req.params;
    try {
        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).send('Supplier not found');
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

const getAllSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.find();
        if (!supplier) {
            return res.status(404).send('Supplier list not found');
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).send('Server error');
    }
};

const editSupplier = async (req, res) => {
    const { id } = req.params;
    const updateSupplier = req.body
    try {
        const supplierData = await Supplier.findByIdAndUpdate(id, updateSupplier, { new: true });
        if (!supplierData) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(201).json({ message: 'Successfully updated the data', supplierData })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating supplier' })

    }
};

const supplierDeleteById = async (req, res) => {
    const { id } = req.params;
    try {
        const supplierData = await Supplier.findByIdAndDelete(id);
        if (!supplierData) {
            return res.status(404).json({ message: "Supplier not found" });
        }
        res.status(200).json({ message: 'Successfully deleted the supplier' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting supplier' });
    }
};

module.exports = { postSupplier, getSupplier, getAllSupplier, editSupplier, supplierDeleteById };