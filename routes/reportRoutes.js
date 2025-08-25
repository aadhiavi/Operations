const express = require('express');
const { postReport, getReport, getReportById, getPdf, getReportByProjectId } = require('../controllers/reportControllers');
const router = express.Router();

router.post('/practice-reports', postReport);
router.get('/practice-reports', getReport);
router.get('/practice-reports/:id', getReportById);
router.get('/pdf', getPdf);
router.get('/project-reports/:projectId', getReportByProjectId);

module.exports = router;