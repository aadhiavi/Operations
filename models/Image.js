const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', },
  url: String,
  public_id: String,
});

module.exports = mongoose.model('Image', imageSchema);
