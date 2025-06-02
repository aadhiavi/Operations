const express = require('express')
const { postBoqProject, getBoqProjects } = require('../controllers/boqProjectControllers')
const router = express.Router()

router.post('/boq-form', postBoqProject);
router.get('/boq-list', getBoqProjects)

module.exports = router