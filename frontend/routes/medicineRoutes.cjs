const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine.cjs');
const { verifyToken}  = require('../middlewares/auth.cjs')

// GET all medicines for user
router.get('/',verifyToken, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

// POST new medicine
router.post('/',verifyToken, async (req, res) => {
  try {
    console.log('📥 Received medicine data:', {
      name: req.body.name,
      // userId: req.userId,
      userId: req.userId,
      hasImage: !!req.body.imageUrl
    });
    
    const newMedicine = new Medicine({
      ...req.body,
      // userId: req.userId
      userId: req.userId
    });
    await newMedicine.save();
    console.log('✅ Medicine saved successfully');
    res.status(201).json(newMedicine);
  } catch (error) {
    console.error('❌ Error saving medicine:', error);
    res.status(500).json({ error: 'Failed to add medicine', details: error.message });
  }
});

// DELETE medicine
router.delete('/:id',verifyToken, async (req, res) => {
  try {
    await Medicine.findOneAndDelete({ 
      _id: req.params.id, 
      // userId: req.userId 
      userId: req.userId
    });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// POST mark dose as taken
router.post('/:id/take-dose',verifyToken, async (req, res) => {
  try {
    const medicine = await Medicine.findOne({ 
      _id: req.params.id, 
      // userId: req.userId 
      userId: req.userId
    });
    
    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    
    medicine.consumedTablets += medicine.tabletsPerDose;
    await medicine.save();
    
    const remaining = medicine.totalTablets - medicine.consumedTablets;
    const daysLeft = Math.floor(remaining / (medicine.tabletsPerDose * medicine.timesSelected.length));
    
    res.json({ ...medicine.toObject(), remainingDays: daysLeft });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dose' });
  }
});

module.exports = router;