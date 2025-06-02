const MaterialMaster = require("../models/materialMaster");

const postMaterial = async (req, res) => {
    try {
        const materialData = { ...req.body };
        const newMaterial = new MaterialMaster(materialData);
        await newMaterial.save();
        res.status(201).json(newMaterial);
    } catch (error) {
        res.status(500).send('Server error');
    }
};


const getMaterial = async (req, res) => {
    const { vendor } = req.query;
    try {
        let materialData;
        if (vendor) {
            materialData = await MaterialMaster.find({ vendor });
        } else {
            materialData = await MaterialMaster.find();
        }
        res.status(200).json({
            message: 'Successfully fetched the data',
            materialData
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error occurred while fetching data',
            error: error.message
        });
    }
};

const getMaterialById = async (req, res) => {
    const { id } = req.params;
    try {
        const material = await MaterialMaster.findById(id);
        if (!material) {
            return res.status(404).json({
                message: 'Material not found',
            });
        }
        res.status(200).json({
            message: 'Successfully fetched material data',
            material,
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error occurred while fetching material by ID',
            error: error.message,
        });
    }
};


const editMaterial = async (req, res) => {
    const { id } = req.params;
    const updateMaterial = req.body
    try {
        const materialData = await MaterialMaster.findByIdAndUpdate(id, updateMaterial, { new: true });
        if (!materialData) {
            return res.status(404).json({ message: "Material not found" });
        }
        res.status(201).json({ message: 'Successfully updated the data', materialData })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating material' })

    }
};

const deleteMaterial = async (req, res) => {
    const { id } = req.params;
    try {
        const materialData = await MaterialMaster.findByIdAndDelete(id);
        if (!materialData) {
            return res.status(404).json({ message: 'Material not found' })
        }
        res.status(200).json({ message: 'Succussfully deleted material data' })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Something went wrong please try again later' })
    }
};

module.exports = { postMaterial, getMaterial, editMaterial, deleteMaterial,getMaterialById };