const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const BoqSheet = require('../models/BoqSheet');

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });


router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const projectName = req.body.projectName;
        if (!projectName) {
            return res.status(400).json({ error: 'projectName is required' });
        }

        const workbook = XLSX.readFile(req.file.path);
        const sheetNames = workbook.SheetNames;

        // Optional: Clear previous data for the same project
        await BoqSheet.deleteMany({ projectName });

        const boqData = [];

        for (const sheetName of sheetNames) {
            const worksheet = workbook.Sheets[sheetName];

            // Step 1: Convert to JSON with default for missing cells
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '--' });

            // Step 2: Detect used (non-empty) columns
            const columnUsage = {};
            jsonData.forEach(row => {
                Object.entries(row).forEach(([key, value]) => {
                    if (value !== '--' && value !== '' && value !== null && value !== undefined) {
                        columnUsage[key] = true;
                    }
                });
            });

            const usedKeys = Object.keys(columnUsage); // Columns actually in use

            // Step 3: Clean and align data rows
            const alignedData = jsonData.map(row => {
                const alignedRow = {};
                usedKeys.forEach(key => {
                    let value = row[key];
                    if (value === undefined || value === '') value = '--';
                    if (typeof value === 'number') value = parseFloat(value.toFixed(3));
                    alignedRow[key] = value;
                });
                return alignedRow;
            });

            // Step 4: Push to boqData array
            boqData.push({
                sheetName,
                data: alignedData
            });
        }

        // Save all sheets under one BoqSheet document
        const boqSheet = new BoqSheet({
            projectName,
            boqData
        });

        await boqSheet.save();

        res.json({ message: '✅ Excel data uploaded successfully!', sheetCount: boqData.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '❌ Failed to process Excel file' });
    }
});

router.get('/sheets/:id', async (req, res) => {
    try {
        const sheet = await BoqSheet.findById(req.params.id);
        if (!sheet) {
            return res.status(404).json({ error: 'Sheet not found' });
        }
        res.json(sheet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheets' });
    }
});


router.get('/sheets', async (req, res) => {
    try {
        const sheets = await BoqSheet.find({});
        res.json(sheets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheets' });
    }
});


router.get('/sheets/:sheetName', async (req, res) => {
    try {
        const sheet = await BoqSheet.findOne({ sheetName: req.params.sheetName });
        if (!sheet) {
            return res.status(404).json({ error: 'Sheet not found' });
        }
        res.json(sheet);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve sheet' });
    }
});


module.exports = router;
