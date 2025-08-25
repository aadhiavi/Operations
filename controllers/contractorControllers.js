const Contractor = require("../models/Contractor");
const WorkItem = require("../models/WorkItem");

const createContractor = async (req, res) => {
    try {
        const {
            projectId,
            contractorName,
            contactNumber,
            workItems
        } = req.body;
        const resolvedWorkItems = await Promise.all(workItems.map(async (item) => {
            let workItemDoc = await WorkItem.findOne({
                workDescription: item.workItem.workDescription,
                quantity: item.workItem.quantity,
                unitName: item.workItem.unitName,
                rate: item.workItem.rate
            });

            if (!workItemDoc) {
                workItemDoc = await WorkItem.create(item.workItem);
            }

            return {
                workItem: workItemDoc._id,
                contractDate: item.contractDate
            };
        }));

        const newContractor = await Contractor.create({
            projectId,
            contractorName,
            contactNumber,
            workItems: resolvedWorkItems
        });

        res.status(201).json(newContractor);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server error',
            error
        });
    }
};

const getContractorsBySite = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!projectId) {
            return res.status(400).json({ message: "Missing projectId parameter" });
        }

        const projectContractors = await Contractor.find({ projectId })
            .populate("projectId", "name")
            .populate("workItems.workItem")
            .exec();

        if (!projectContractors || projectContractors.length === 0) {
            return res.status(404).json({ message: "No contractors found for this project" });
        }

        const projectName = projectContractors[0]?.projectId?.name || "Unknown Project";

        res.status(200).json({
            message: "Successfully fetched the data",
            project: {
                projectId,
                projectName
            },
            contractors: projectContractors
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getContractorById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Missing Contractor Id parameter" });
        }

        const contractor = await Contractor.findById(id)
            .populate("projectId", "name")
            .populate('workItems.workItem')
            .exec();

        if (!contractor) {
            return res.status(404).json({ message: "Contractor not found" });
        }

        res.status(200).json({
            message: "Successfully fetched the data",
            contractor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const updateContractorById = async (req, res) => {
    try {
        const contractorId = req.params.id;
        const { contractorName, contactNumber, projectId, workItems } = req.body;

        const processedWorkItems = [];

        for (const item of workItems) {
            let workItemDoc;

            if (item.workItem._id) {
                // Update existing WorkItem
                workItemDoc = await WorkItem.findByIdAndUpdate(
                    item.workItem._id,
                    item.workItem,
                    { new: true, runValidators: true }
                );
            } else {
                // Create new WorkItem
                const newWorkItem = new WorkItem(item.workItem);
                workItemDoc = await newWorkItem.save();
            }

            processedWorkItems.push({
                workItem: workItemDoc._id,
                status: item.status || 'active',
                contractDate: item.contractDate || new Date()
            });
        }

        const updatedContractor = await Contractor.findByIdAndUpdate(
            contractorId,
            {
                contractorName,
                contactNumber,
                projectId,
                workItems: processedWorkItems
            },
            { new: true, upsert: true }
        ).populate('workItems.workItem');

        res.status(200).json(updatedContractor);
    } catch (err) {
        console.error("Error updating contractor:", err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteWorkItemFromContractor = async (req, res) => {
    const { contractorId, workItemId } = req.params;
    try {
        const contractor = await Contractor.findById(contractorId);
        if (!contractor) {
            return res.status(404).json({ error: 'Contractor not found' });
        }
        const itemExists = contractor.workItems.some(
            (item) => item.workItem.toString() === workItemId
        );
        if (!itemExists) {
            return res.status(404).json({ error: 'Work item not found in contractor' });
        }
        contractor.workItems = contractor.workItems.filter(
            (item) => item.workItem.toString() !== workItemId
        );
        await contractor.save();
        await WorkItem.findByIdAndDelete(workItemId);

        return res.status(200).json({
            message: 'Work item removed from contractor and deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting work item from contractor:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = { createContractor, getContractorById, getContractorsBySite, updateContractorById, deleteWorkItemFromContractor };