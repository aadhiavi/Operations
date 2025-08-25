const express = require('express');
const multer = require("multer");
const {
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
    createBoqItem,
    updatePhase,
    getPhaseById,
    getBoqItemsByPhase,
    updateBoqItem,
    deleteBoqItem,
    uploadxlFileBoqItems,
} = require('../controllers/boqProjectControllers');
const {
    createRequisition,
    getRequisitions,
    getRequisitionByNumber,
    updateRequisition,
    getAvailableItems,
    addItemsToRequisition
} = require('../controllers/materialRequisitionController');
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/boq-form', postBoqProject);
router.post('/boq-test', postTestBoqProject);
router.get('/boq-test', getTestBoqProject);
router.get('/boq-list', getBoqProjects)
router.get('/boq-list/:id', getBoqProjectById)
router.post('/boq-test/:projectId/add-phase', addPhaseToProject);
router.get('/projects/full', getTestBoqItems)
router.get('/projects/full/:projectId', getTestBoqItemByProjectId)

router.post("/requisitions", createRequisition);
router.get('/requisitions', getRequisitions);
router.get("/requisitions/:number", getRequisitionByNumber);
router.put('/requisitions/:number', updateRequisition);
router.get('/items/:boqItemId/availability', getAvailableItems);
router.put("/requisitions/:number/add-items", addItemsToRequisition);


router.post('/project', createProject);
router.post('/project-phase', createPhase);
router.get('/project-phase/:id', getPhaseById);
router.put('/project-phase/:id', updatePhase);
router.post('/project-phase-item', createBoqItem);
router.get('/project-phase-item/:phaseId', getBoqItemsByPhase);
router.put('/project-phase-item/:itemId', updateBoqItem);
router.delete('/project-phase-item/:itemId', deleteBoqItem);
router.post('/project-phase-item-xl/:phaseId', upload.single("file"), uploadxlFileBoqItems);

module.exports = router   