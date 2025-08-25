const express = require('express');
const { createContractor, getContractorById, getContractorsBySite, updateContractorById, deleteWorkItemFromContractor, } = require('../controllers/contractorControllers');
const router = express.Router();

router.post('/post', createContractor);
router.get('/:id', getContractorById);
router.put('/:id', updateContractorById);
router.get('/list/:projectId', getContractorsBySite);
router.delete('/:contractorId/workItem/:workItemId', deleteWorkItemFromContractor);

module.exports = router;