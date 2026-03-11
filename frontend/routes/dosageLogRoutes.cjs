// backend/dosageLogRoutes.cjs
const express = require('express');
const router = express.Router();
const DosageLog = require('../models/dosageLogSchema.cjs');
const Medicine = require('../models/Medicine.cjs');
const {verifyToken} = require('../middlewares/auth.cjs')
// GET today's logs
router.use(verifyToken)
router.get('/today', async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const logs = await DosageLog.find({
      userId: req.userId,
      scheduledTime: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ scheduledTime: 1 });
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// POST generate today's logs (debug button)
// POST generate today's logs (debug button)
router.post('/generate-today', async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.userId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const logsToCreate = [];
    
    for (const med of medicines) {
      for (const timeSlot of med.timesSelected) {
        const timeString = med.customTimes[timeSlot];
        if (!timeString) continue;
        
        const [hh, mm] = timeString.split(':').map(Number);
        const scheduledTime = new Date(today);
        scheduledTime.setHours(hh, mm, 0, 0);
        
        // Add debug logging
        console.log('🔍 Generating log:', {
          medicine: med.name,
          timeSlot,
          timeString,
          scheduledTime: scheduledTime.toLocaleString()
        });
        
        // Check if log already exists
        const existingLog = await DosageLog.findOne({
          userId: req.userId,
          medicineId: med._id.toString(),
          scheduledTime: scheduledTime
        });
        
        if (!existingLog) {
          // ✅ Always start as 'pending' - let user or cron job mark as missed later
          logsToCreate.push({
            userId: req.userId,
            medicineId: med._id.toString(),
            medicineName: med.name,
            scheduledTime,
            status: 'pending', // Always pending on generation
            tabletsPerDose: med.tabletsPerDose,
            timeSlot
          });
        }
      }
    }
    
    if (logsToCreate.length > 0) {
      await DosageLog.insertMany(logsToCreate);
    }
    
    res.json({ 
      message: `Generated ${logsToCreate.length} logs`,
      logs: logsToCreate
    });
  } catch (error) {
    console.error('Generate logs error:', error);
    res.status(500).json({ error: 'Failed to generate logs' });
  }
});

// POST create single log
router.post('/', async (req, res) => {
  try {
    const { medicineId, scheduledTime, timeSlot, tabletsPerDose, medicineName } = req.body;
    
    const existing = await DosageLog.findOne({
      userId: req.userId,
      medicineId,
      scheduledTime: new Date(scheduledTime)
    });
    
    if (existing) {
      return res.json(existing);
    }
    
    const newLog = new DosageLog({
      userId: req.userId,
      medicineId,
      medicineName,
      scheduledTime: new Date(scheduledTime),
      status: 'pending',
      tabletsPerDose,
      timeSlot
    });
    
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create log' });
  }
});

// PATCH mark as taken
router.patch('/:logId/take', async (req, res) => {
  try {
    const log = await DosageLog.findOne({
      _id: req.params.logId,
      userId: req.userId
    });
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    log.status = 'taken';
    log.takenAt = new Date();
    await log.save();
    
    const medicine = await Medicine.findOne({
      _id: log.medicineId,
      userId: req.userId
    });
    
    if (medicine) {
      medicine.consumedTablets = (medicine.consumedTablets || 0) + medicine.tabletsPerDose;
      await medicine.save();
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as taken' });
  }
});

// PATCH mark as missed
router.patch('/:logId/miss', async (req, res) => {
  try {
    const log = await DosageLog.findOneAndUpdate(
      { _id: req.params.logId, userId: req.userId },
      { status: 'missed' },
      { new: true }
    );
    
    if (!log) {
      return res.status(404).json({ error: 'Log not found' });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as missed' });
  }
});

// PATCH bulk mark as missed (2-hour rule)
router.patch('/bulk-miss', async (req, res) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const result = await DosageLog.updateMany(
      {
        userId: req.userId,
        status: 'pending',
        scheduledTime: { $lte: twoHoursAgo }
      },
      {
        status: 'missed'
      }
    );
    
    res.json({ 
      message: `Marked ${result.modifiedCount} logs as missed`,
      count: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to bulk update' });
  }
});

module.exports = router;