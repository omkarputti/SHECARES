const express = require('express');
const router = express.Router();
const Incident = require('../models/Incident.cjs');

// POST submit incident report
router.post('/submit-form', async (req, res) => {
  console.log('✅ Request received at /api/submit-form');
  
  try {
    const newIncident = new Incident(req.body);
    await newIncident.save();
    console.log('✅ Data saved to MongoDB');
    res.status(201).json({ message: 'Submission successful!' });
  } catch (error) {
    console.error('❌ Error saving data:', error);
    res.status(500).json({ message: 'Server error during submission.' });
  }
});

module.exports = router;