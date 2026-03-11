const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  tabletsPerDose: { type: Number, required: true },
  totalTablets: { type: Number, required: true },
  consumedTablets: { type: Number, default: 0 },
  timesSelected: [String],
  customTimes: { type: Object },
  foodTiming: { type: String },
  imageUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);