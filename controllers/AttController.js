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
    structuredData = {}; // Reset for each upload
    processData(filePath);

    const createdRecords = [];
    const updatedRecords = [];
    const skippedRecords = [];
    const missPunches = [];

    try {
        for (const id in structuredData) {
            for (const date in structuredData[id]) {
                let { in: inTime, out: outTime } = structuredData[id][date];

                // Handle missing punch
                if (!inTime || !outTime || inTime === outTime) {
                    const time = inTime || outTime;
                    inTime = outTime = time;
                    missPunches.push({ id, date, time });
                }

                const existing = await Attendance.findOne({ id, date });

                if (!existing) {
                    const newRecord = new Attendance({ id, date, in: inTime, out: outTime });
                    await newRecord.save();
                    createdRecords.push({ id, date });
                } else {
                    const shouldUpdate =
                        (inTime < existing.in) || (outTime > existing.out);

                    if (shouldUpdate) {
                        existing.in = inTime < existing.in ? inTime : existing.in;
                        existing.out = outTime > existing.out ? outTime : existing.out;
                        await existing.save();
                        updatedRecords.push({ id, date });
                    } else {
                        skippedRecords.push({ id, date, reason: 'Existing record is better or same' });
                    }
                }
            }
        }

        res.json({
            message: 'Attendance file processed.',
            created: createdRecords,
            updated: updatedRecords,
            skipped: skippedRecords,
            missPunches: missPunches
        });
    } catch (error) {
        console.error('Error processing attendance:', error);
        res.status(500).json({ message: 'Server error while processing attendance data.' });
    }
});


router.post('/att-manual-post', async (req, res) => {
    const { id, date, in: inTime, out: outTime } = req.body;

    if (!id || !date || !inTime || !outTime) {
        return res.status(400).json({ message: 'All fields (id, date, in, out) are required.' });
    }
    try {
        const existingAttendance = await Attendance.findOne({ id, date });
        if (existingAttendance) {
            return res.status(404).json({ message: 'Attendance record already exists for this ID and date.' });
        }
        const attendance = new Attendance({
            id,
            date,
            in: inTime,
            out: outTime,
        });
        await attendance.save();
        res.json({ message: 'Attendance record created successfully.' });
    } catch (error) {
        console.error('Error saving attendance record:', error);
        res.status(500).json({ message: 'Server error while saving attendance data.' });
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

router.put('/att-manual', async (req, res) => {
    const { id, date, in: inTime, out: outTime } = req.body;

    if (!inTime || !outTime) {
        return res.status(400).json({ message: 'All fields (id, date, in, out) are required.' });
    }

    try {
        const existing = await Attendance.findOne({ id, date });

        if (!existing) {
            return res.status(404).json({ message: 'Attendance record not found. Cannot update non-existent entry.' });
        }

        existing.in = inTime;
        existing.out = outTime;
        await existing.save();
        res.json({ message: 'Attendance record updated successfully.' });
    } catch (error) {
        console.error('Manual update error:', error);
        res.status(500).json({ message: 'Server error while updating attendance data.' });
    }
});


module.exports = router;