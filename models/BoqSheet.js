// const mongoose = require('mongoose');

// const BoqSchema = new mongoose.Schema({
//   sheetName: String,
//   metaInfo: String, 
//   data: [mongoose.Schema.Types.Mixed] 
// });

// module.exports = mongoose.model('BoqSheet', BoqSchema);


const mongoose = require('mongoose');
const BoqSchema = new mongoose.Schema({
  sheetName: String,
  data: [{ type: mongoose.Schema.Types.Mixed }]
}, { timestamps: true });

const BoqSheetSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true
  },
  boqData: [BoqSchema]
}, { timestamps: true });

module.exports = mongoose.model('BoqSheet', BoqSheetSchema);