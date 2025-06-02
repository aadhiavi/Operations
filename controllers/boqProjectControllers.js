const express = require("express");
const BoqProject = require("../models/BoqProject");

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

module.exports = {postBoqProject, getBoqProjects}