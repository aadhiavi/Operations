const express = require('express');
const upload = require('../middleware/multer');
const { uploadImage, getImages, getAllImagesForAdmin } = require('../controllers/imageController');
const { authenticate, isAdmin } = require('../middleware/auth');
const router = express.Router();

router.post('/upload', authenticate, upload.single('image'), uploadImage);
router.get('/images', authenticate, getImages);
router.get('/admin/images', authenticate, isAdmin, getAllImagesForAdmin);

module.exports = router;
