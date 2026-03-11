const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  incidentType: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);