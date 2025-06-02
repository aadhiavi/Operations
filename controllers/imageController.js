const Image = require("../models/Image");
const cloudinary = require("../config/cloudinary");

const uploadImage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const existingImage = await Image.findOne({ user: userId });
    if (existingImage) {
      await cloudinary.uploader.destroy(existingImage.public_id);
      await existingImage.deleteOne();
    }
    const newImage = await Image.create({
      url: req.file.path,
      public_id: req.file.filename,
      user: userId,
    });

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: newImage,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const images = await Image.find({ user: userId });
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch images' });
  }
};

const getAllImagesForAdmin = async (req, res) => {
  try {
    const images = await Image.find().populate('user', 'tradeId');
    res.status(200).json(images);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all user images', error: err.message });
  }
};


module.exports = { uploadImage, getImages,getAllImagesForAdmin };
