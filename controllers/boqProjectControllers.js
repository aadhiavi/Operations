const express = require("express");
const BoqProject = require("../models/BoqProject");
const TestBoqProject = require("../models/TestBoqProject");
const TestProjectPhase = require("../models/TestProjectPhase");
const TestBoqItem = require("../models/TestBoqItem");
const MaterialRequisition = require("../models/MaterialRequisition");
const XLSX = require("xlsx");

const createProject = async (req, res) => {
  try {
    const { name, clientName, location } = req.body;
    const project = await TestBoqProject.create({ name, clientName, location });
    res.status(201).json({ projectId: project._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating project" });
  }
};

const createPhase = async (req, res) => {
  try {
    const { projectId, phaseName, startDate, endDate, description, works } = req.body;
    const phase = await TestProjectPhase.create({
      projectId,
      phaseName,
      startDate,
      endDate,
      description,
      works
    });
    res.status(201).json({ phaseId: phase._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating phase" });
  }
};

const getPhaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const phase = await TestProjectPhase.findById(id).lean();
    if (!phase) {
      return res.status(404).json({ message: "Phase not found" });
    }
    res.json(phase);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching phase" });
  }
};

const updatePhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, phaseName, startDate, endDate, description, works } = req.body;

    const updatedPhase = await TestProjectPhase.findByIdAndUpdate(
      id,
      {
        projectId,
        phaseName,
        startDate,
        endDate,
        description,
        works,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPhase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    res.status(200).json({ message: "Phase updated", phase: updatedPhase });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating phase" });
  }
};

const createBoqItem = async (req, res) => {
  try {
    const { phaseId, itemName, unit, quantity, remarks } = req.body;
    const boqItem = await TestBoqItem.create({
      phaseId,
      itemName,
      unit,
      quantity,
      remarks
    });
    res.status(201).json({ itemId: boqItem._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating BoQ item" });
  }
};

const getBoqItemsByPhase = async (req, res) => {
  try {
    const { phaseId } = req.params;
    const boqItems = await TestBoqItem.find({ phaseId }).lean();
    res.json(boqItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching BoQ items for phase" });
  }
};

const updateBoqItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { itemName, unit, quantity, remarks } = req.body;

    const existingItem = await TestBoqItem.findById(itemId);
    if (!existingItem) {
      return res.status(404).json({ message: "BoQ item not found" });
    }

    // Compare old and new values
    if (
      existingItem.itemName === itemName &&
      existingItem.unit === unit &&
      existingItem.quantity === quantity &&
      existingItem.remarks === remarks
    ) {
      return res.status(200).json({ message: "No changes detected" });
    }

    const updatedItem = await TestBoqItem.findByIdAndUpdate(
      itemId,
      { itemName, unit, quantity, remarks },
      { new: true }
    );

    res.json({ message: "BoQ item updated", item: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating BoQ item" });
  }
};

const deleteBoqItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await TestBoqItem.findByIdAndDelete(itemId);
    res.json({ message: "BoQ item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting BoQ item" });
  }
};

const uploadxlFileBoqItems = async (req, res) => {
  const { phaseId } = req.params;

  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    const items = data.map(row => ({
      phaseId: phaseId,
      itemName: row["itemName"],
      unit: row["unit"],
      quantity: parseFloat(row["quantity"]),
      remarks: row["remarks"] || ""
    }));

    const result = await TestBoqItem.insertMany(items);
    res.status(200).json({ message: "Items uploaded successfully", inserted: result.length });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBoqProjectById = async (req, res) => {
  try {
    const project = await BoqProject.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}



















// Express route handler
const getTestBoqItems = async (req, res) => {
  try {
    const projects = await TestBoqProject.find().lean();

    const result = await Promise.all(projects.map(async (project) => {
      const phases = await TestProjectPhase.find({ projectId: project._id }).lean();

      const phaseData = await Promise.all(phases.map(async (phase) => {
        const boqItems = await TestBoqItem.find({ phaseId: phase._id }).lean();
        const requisitions = await MaterialRequisition.find({
          phaseId: phase._id,
          projectId: project._id
        }).lean();

        return {
          ...phase,
          boqItems,
          requisitions
        };
      }));

      return {
        ...project,
        phases: phaseData
      };
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTestBoqItemByProjectId = async (req, res) => {
  const { projectId } = req.params;

  try {
    // 1. Get the project
    const project = await TestBoqProject.findById(projectId).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });

    // 2. Get all phases
    const phases = await TestProjectPhase.find({ projectId }).lean();
    const phaseIds = phases.map(p => p._id);

    // 3. Get all BoQ items
    const boqItems = await TestBoqItem.find({ phaseId: { $in: phaseIds } }).lean();

    // 4. Aggregate total requested quantity for each BoQ item
    const requisitionAgg = await MaterialRequisition.aggregate([
      { $match: { projectId: project._id } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.boqItemId",
          totalRequested: { $sum: "$items.quantityRequested" }
        }
      }
    ]);

    // 5. Map of itemId => totalRequested
    const requisitionMap = {};
    requisitionAgg.forEach(r => {
      requisitionMap[r._id.toString()] = r.totalRequested;
    });

    // 6. Enhance each BoQ item with requisition info
    const boqMap = {};
    boqItems.forEach(item => {
      const totalRequested = requisitionMap[item._id.toString()] || 0;
      const remaining = item.quantity - totalRequested;

      const itemWithStatus = {
        ...item,
        totalQuantity: item.quantity,
        totalRequested,
        remaining
      };

      if (!boqMap[item.phaseId]) boqMap[item.phaseId] = [];
      boqMap[item.phaseId].push(itemWithStatus);
    });

    // 7. Build phase structure
    const enrichedPhases = phases.map(phase => ({
      ...phase,
      boqItems: boqMap[phase._id] || []
    }));

    // 8. Final result
    const result = {
      ...project,
      phases: enrichedPhases
    };

    res.json(result);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const postTestBoqProject = async (req, res) => {
  try {
    const { name, clientName, location, phases } = req.body;

    // Step 1: Create the Project
    const project = await TestBoqProject.create({ name, clientName, location });

    // Step 2: Loop through and create phases
    for (const phaseData of phases) {
      const { phaseName, startDate, endDate, description, works, boqItems } = phaseData;

      const phase = await TestProjectPhase.create({
        projectId: project._id,
        phaseName,
        startDate,
        endDate,
        description,
        works
      });

      // Step 3: Loop through and create BoQ items for each phase
      for (const item of boqItems) {
        await TestBoqItem.create({
          phaseId: phase._id,
          itemCode: item.itemCode,
          itemName: item.itemName,
          unit: item.unit,
          quantity: item.quantity,
          remarks: item.remarks
        });
      }
    }

    res.status(201).json({ message: "Project created successfully", projectId: project._id });
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// PROJECT ROUTEs
const postBoqProject = async (req, res) => {
  try {
    const project = new BoqProject(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBoqProjects = async (req, res) => {
  try {
    const projects = await BoqProject.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}



// const postTestBoqProject = async (req, res) => {
//   try {
//     const project = new TestBoqProject(req.body);
//     await project.save();
//     res.status(201).json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// const getTestBoqProject = async (req, res) => {
//   try {
//     const projects = await TestBoqProject.find();
//     res.json(projects);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// }

const getTestBoqProject = async (req, res) => {
  try {
    const project = await TestBoqProject.find();
    if (!project) {
      return res.status(404).json({ error: 'No project found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addPhaseToProject = async (req, res) => {
  const { projectId } = req.params;
  const newPhase = req.body;

  try {
    const updatedProject = await TestBoqProject.findByIdAndUpdate(
      projectId,
      { $push: { phases: newPhase } },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// router.get("/boqs/:projectId", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     if (!project) return res.status(404).json({ error: "Project not found" });
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.put("/boqs/:projectId", async (req, res) => {
//   try {
//     const updated = await BoqProject.findByIdAndUpdate(req.params.projectId, req.body, { new: true });
//     res.json(updated);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.delete("/boqs/:projectId", async (req, res) => {
//   try {
//     await BoqProject.findByIdAndDelete(req.params.projectId);
//     res.json({ message: "Project deleted" });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// // PHASE ROUTES
// router.post("/boqs/:projectId/phases", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases.push(req.body);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.put("/boqs/:projectId/phases/:phaseIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases[req.params.phaseIndex] = {
//       ...project.phases[req.params.phaseIndex]._doc,
//       ...req.body,
//     };
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// router.delete("/boqs/:projectId/phases/:phaseIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases.splice(req.params.phaseIndex, 1);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// // MATERIAL ROUTES (Inside Phase)
// router.post("/boqs/:projectId/phases/:phaseIndex/materials", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     const phase = project.phases[req.params.phaseIndex];
//     phase.materials.push(req.body);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.put("/boqs/:projectId/phases/:phaseIndex/materials/:materialIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases[req.params.phaseIndex].materials[req.params.materialIndex] = {
//       ...project.phases[req.params.phaseIndex].materials[req.params.materialIndex]._doc,
//       ...req.body,
//     };
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.delete("/boqs/:projectId/phases/:phaseIndex/materials/:materialIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases[req.params.phaseIndex].materials.splice(req.params.materialIndex, 1);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// // WORK ROUTES (Inside Phase)
// router.post("/boqs/:projectId/phases/:phaseIndex/works", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     const phase = project.phases[req.params.phaseIndex];
//     phase.works.push(req.body);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.put("/boqs/:projectId/phases/:phaseIndex/works/:workIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases[req.params.phaseIndex].works[req.params.workIndex] = {
//       ...project.phases[req.params.phaseIndex].works[req.params.workIndex]._doc,
//       ...req.body,
//     };
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// router.delete("/boqs/:projectId/phases/:phaseIndex/works/:workIndex", async (req, res) => {
//   try {
//     const project = await BoqProject.findById(req.params.projectId);
//     project.phases[req.params.phaseIndex].works.splice(req.params.workIndex, 1);
//     await project.save();
//     res.json(project);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

module.exports = {
  postBoqProject,
  getBoqProjects,
  getBoqProjectById,
  postTestBoqProject,
  getTestBoqProject,
  addPhaseToProject,
  getTestBoqItems,
  getTestBoqItemByProjectId,
  createProject,
  createPhase,
  updatePhase,
  getPhaseById,
  createBoqItem,
  getBoqItemsByPhase,
  deleteBoqItem,
  updateBoqItem,
  uploadxlFileBoqItems
}