const mongoose = require('mongoose');

const wasteCollectionSchema = new mongoose.Schema({
  total: {
    type: Number,
    required: true,
  },
});

const WasteCollection = mongoose.model('WasteCollection', wasteCollectionSchema);

module.exports = WasteCollection;
