const mongoose = require('mongoose');

const dosageLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  medicineId: {
    type: String,
    required: true,
    index: true
  },
  medicineName: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed'],
    default: 'pending',
    index: true
  },
  takenAt: {
    type: Date,
    default: null
  },
  tabletsPerDose: {
    type: Number,
    required: true
  },
  timeSlot: {
    type: String, // 'Morning', 'Afternoon', 'Night'
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
dosageLogSchema.index({ userId: 1, scheduledTime: -1 });
dosageLogSchema.index({ userId: 1, medicineId: 1, scheduledTime: -1 });

module.exports = mongoose.model('DosageLog', dosageLogSchema);