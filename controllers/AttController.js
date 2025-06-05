const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const { isAdmin, authenticate } = require('../middleware/auth');
const upload = multer({ dest: 'uploads/att' });
const router = express.Router();

let structuredData = {};  // Declare globally

const processData = (filePath) => {
    const dataByID = {};

    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    lines.forEach(line => {
        const parts = line.trim().split('\t');
        if (parts.length >= 2) {
            const id = parts[0];
            const timestamp = parts[1];
            const date = timestamp.split(' ')[0];  // Extract the date part (YYYY-MM-DD)
            const time = timestamp.split(' ')[1].slice(0, 5);  // Extract HH:MM part of time

            if (!dataByID[id]) dataByID[id] = {};
            if (!dataByID[id][date]) dataByID[id][date] = [];
            // Add the time to the corresponding ID and date
            dataByID[id][date].push(time);
        }
    });

    // Process dataByID and determine in and out times
    Object.keys(dataByID).forEach(id => {
        if (!structuredData[id]) structuredData[id] = {};  // Keep old data for each ID if available
        Object.keys(dataByID[id]).forEach(date => {
            const times = dataByID[id][date].sort();  // Sort times in ascending order
            if (times.length > 0) {
                structuredData[id][date] = {
                    in: times[0],  // Earliest time is "in"
                    out: times[times.length - 1],  // Latest time is "out"
                };
            }
        });
    });
};

router.post('/att-upload', upload.single('file'), async (req, res) => {
    const filePath = req.file.path;
    structuredData = {};
    processData(filePath);

    const createdRecords = [];
    const skippedRecords = [];
    const missPunches = [];

    try {
        for (const id in structuredData) {
            for (const date in structuredData[id]) {
                let { in: inTime, out: outTime } = structuredData[id][date];

                if (!inTime || !outTime || inTime === outTime) {
                    const time = inTime || outTime;
                    inTime = outTime = time;
                    missPunches.push({ id, date, time });
                }

                try {
                    const newRecord = new Attendance({ id, date, in: inTime, out: outTime });
                    await newRecord.save();
                    createdRecords.push({ id, date });
                } catch (err) {
                    if (err.code === 11000) {
                        skippedRecords.push({ id, date, reason: 'Duplicate – record already exists' });
                    } else {
                        throw err;
                    }
                }
            }
        }

        res.json({
            message: 'Attendance file processed.',
            created: createdRecords,
            skipped: skippedRecords,
            missPunches
        });
    } catch (error) {
        console.error('Error processing attendance:', error);
        res.status(500).json({ message: 'Server error while processing attendance data.' });
    }
});

router.put('/att-manual-update-time', authenticate, isAdmin, async (req, res) => {
  const { id, date, in: inTime, out: outTime } = req.body;

  if (!id || !date || !inTime || !outTime) {
    return res.status(400).json({ message: 'All fields (id, date, in, out) are required.' });
  }

  try {
    const record = await Attendance.findOne({ id, date });

    if (!record) {
      return res.status(404).json({ message: 'Attendance record not found.' });
    }

    record.in = inTime;
    record.out = outTime;
    await record.save();

    res.json({ message: 'Attendance updated successfully.' });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ message: 'Server error while updating attendance.' });
  }
});

router.get('/att-data/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const attendanceData = await Attendance.find({ id });
        if (attendanceData.length > 0) {
            res.json(attendanceData);
        } else {
            res.status(404).json({ message: 'ID not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from the database' });
    }
});

router.get('/att-data/date/:date', async (req, res) => {
    const { date } = req.params;
    try {
        const attendanceData = await Attendance.find({ date });
        res.json(attendanceData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from the database' });
    }
});

router.get('/att-data-all', authenticate, isAdmin, async (req, res) => {
    try {
        const attendanceData = await Attendance.find({});
        res.json(attendanceData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from the database' });
    }
}
)

router.post('/att-manual-post', async (req, res) => {
    const { id, date, in: inTime, out: outTime } = req.body;

    if (!id || !date || !inTime || !outTime) {
        return res.status(400).json({ message: 'All fields (id, date, in, out) are required.' });
    }

    try {
        const existing = await Attendance.findOne({ id, date });
        if (existing) {
            return res.status(409).json({ message: 'Attendance already exists for this ID and date.' });
        }

        const attendance = new Attendance({ id, date, in: inTime, out: outTime });
        await attendance.save();
        res.json({ message: 'Attendance record created successfully.' });
    } catch (error) {
        console.error('Error saving attendance:', error);
        res.status(500).json({ message: 'Server error while saving attendance.' });
    }
});



module.exports = router;