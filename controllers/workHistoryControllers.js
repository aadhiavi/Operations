const TestProjectPhase = require("../models/TestProjectPhase");
const PhaseWorkHistory = require("../models/PhaseWorkHistory");
const TestBoqPhaseWork = require("../models/TestBoqPhaseWork");

const createPhaseWork = async (req, res) => {
    try {
        const {
            projectId,
            phaseId,
            plannedStartDate,
            plannedEndDate,
            actualStartDate,
            actualEndDate,
            workName,
            status,
            description,
            remarks
        } = req.body;

        if (!projectId || !phaseId || !workName) {
            return res.status(400).json({ message: "projectId, phaseId, and workName are required" });
        }

        if (plannedStartDate && plannedEndDate && new Date(plannedEndDate) < new Date(plannedStartDate)) {
            return res.status(400).json({ message: "Planned end date cannot be before planned start date" });
        }

        if (actualStartDate && actualEndDate && new Date(actualEndDate) < new Date(actualStartDate)) {
            return res.status(400).json({ message: "Actual end date cannot be before actual start date" });
        }

        const phaseWork = await TestBoqPhaseWork.create({
            projectId,
            phaseId,
            plannedStartDate,
            plannedEndDate,
            actualStartDate,
            actualEndDate,
            workName,
            status,
            description,
            remarks
        });

        res.status(201).json(phaseWork);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating phase work", error: err.message });
    }
};

const postWorkHistory = async (req, res) => {
    try {
        const {
            projectId,
            phaseId,
            workId,
            date,
            manpower = [],
            machinery = [],
            materials = [],
            miscellaneous = [],
            wastage = [],
            notes,
            remarks
        } = req.body;

        // 1. Validate phase
        const phase = await TestProjectPhase.findById(phaseId);
        if (!phase) {
            return res.status(404).json({ message: "Phase not found" });
        }

        // const work = phase.works.id(workId);
        // if (!work) {
        //     return res.status(404).json({ message: "Work (task) not found in this phase" });
        // }

        // 2. Auto-calculate costs
        const calcTotal = (arr, key = 'cost') =>
            arr.reduce((sum, item) => sum + (item[key] || 0), 0);

        const totalCost =
            calcTotal(manpower) +
            calcTotal(machinery) +
            calcTotal(materials) +
            calcTotal(miscellaneous) +
            calcTotal(wastage, 'estimatedCost');

        // 3. Create and save the history entry
        const history = await PhaseWorkHistory.create({
            projectId,
            phaseId,
            workId,
            date: date ? new Date(date) : new Date(),
            manpower,
            machinery,
            materials,
            miscellaneous,
            wastage,
            notes,
            remarks,
            totalCost
        });

        res.status(201).json({
            message: "Work history logged successfully",
            history
        });
    } catch (error) {
        console.error("Error posting work history:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getWorkHistory = async (req, res) => {
    try {
        const newHistory = await PhaseWorkHistory.find()
            .populate("projectId", "name")
            .populate("phaseId", "phaseName")
            .populate("workId", "workName")
            .lean();
        // const enrichedHistory = newHistory.map(entry => {
        //     const phase = entry.phaseId;
        //     const work = phase?.works?.find(w => String(w._id) === String(entry.workId));
        //     return {
        //         ...entry,
        //         workName: work?.workName || "Unknown Work"
        //     };
        // });
        res.status(200).json({
            message: 'Succussfully fetched the data',
            newHistory
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Server erron',
            error
        })
    }
}

const getWorkHistoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Missing historyId parameter" });
        }

        const history = await PhaseWorkHistory.findById(id)
            .populate("projectId", "name")
            .populate("phaseId", "phaseName")
            .populate("workId", "workName")
            .lean();

        if (!history) {
            return res.status(404).json({ message: "History not found" });
        }

        res.status(200).json({
            message: "Successfully fetched the data",
            history
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

module.exports = { postWorkHistory, getWorkHistory, createPhaseWork, getWorkHistoryById };

