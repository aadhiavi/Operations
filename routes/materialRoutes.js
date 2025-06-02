const express = require('express');
const router = express.Router();
const { authenticate, isModerator } = require('../middleware/auth');
const { postMaterial, getMaterial, editMaterial, deleteMaterial, getMaterialById } = require('../controllers/materialMasterController');

router.post('/material-master', authenticate, isModerator, postMaterial)
router.get('/material-master', authenticate, isModerator,getMaterial)
router.put("/material-master/:id", authenticate, isModerator,editMaterial)
router.delete('/material-master/:id', authenticate, isModerator, deleteMaterial)
router.get('/material-master/:id', authenticate, isModerator, getMaterialById)

module.exports = router;