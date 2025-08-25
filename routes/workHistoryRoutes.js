const express = require('express');
const { postWorkHistory, getWorkHistory, createPhaseWork, getWorkHistoryById} = require('../controllers/workHistoryControllers');
const router = express.Router();

router.post('/', postWorkHistory)
router.get('/', getWorkHistory)
router.get('/:id', getWorkHistoryById)
router.post('/create-work', createPhaseWork)

module.exports = router;