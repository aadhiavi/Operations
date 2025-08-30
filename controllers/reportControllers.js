const PracticeReport = require("../models/PracticeReport");
const { calculateCost, calculateBaseFare } = require("../utils/formatUtils");
const moment = require('moment');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const postReport = async (req, res) => {
    try {
        const {
            projectId,
            date,
            manpower = [],
            machinery = [],
            material = [],
            wastage = [],
            other = [],
            remarks = ''
        } = req.body;

        let totalCost = 0;

        // 🧠 Process Manpower
        const updatedManpower = manpower.map(entry => {
            let {
                count = 0,
                baseFare = 0,
                cost,
                quantity = 8,
                extraHours = 0
            } = entry;

            // Use custom calculation logic
            if (!cost && baseFare && count >= 0) {
                cost = calculateCost(count, baseFare, quantity, extraHours);
            } else if (!baseFare && cost && count >= 0) {
                baseFare = calculateBaseFare(cost, count, quantity, extraHours);
            }

            totalCost += cost || 0;

            return {
                ...entry,
                baseFare,
                cost
            };
        });

        // 🔁 Reusable function for other item types
        const processItems = (items, costFields = {}) => {
            return items.map(item => {
                let cost = item.cost;

                // Auto-calculate cost if not provided
                if (!cost && costFields.rateField && costFields.quantityField) {
                    const rate = item[costFields.rateField] || 0;
                    const qty = item[costFields.quantityField] || 0;
                    cost = rate * qty;
                }

                cost = cost || 0;
                totalCost += cost;

                return { ...item, cost };
            });
        };

        const updatedMachinery = processItems(machinery, { rateField: "ratePerHour", quantityField: "usageHours" });
        const updatedMaterial = processItems(material, { rateField: "ratePerUnit", quantityField: "quantity" });
        const updatedWastage = processItems(wastage, { rateField: "ratePerUnit", quantityField: "quantity" });
        const updatedOther = processItems(other); // Already includes cost

        // ✅ Save the full report
        const report = new PracticeReport({
            projectId,
            date,
            manpower: updatedManpower,
            machinery: updatedMachinery,
            material: updatedMaterial,
            wastage: updatedWastage,
            other: updatedOther,
            totalCost,
            remarks
        });

        await report.save();

        res.status(201).json(report);
    } catch (error) {
        console.error("Report creation failed:", error);
        res.status(500).json({ error: error.message });
    }
};

const getReport = async (req, res) => {
    try {
        const reports = await PracticeReport.find().sort({ date: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getReportByProjectId = async (req, res) => {
    try {
        const { projectId } = req.params;
        const reports = await PracticeReport.find({ projectId })
            .sort({ date: -1 })
            .populate({ path: 'projectId', select: 'name' });
        if (!reports || reports.length === 0) {
            return res.status(404).json({ error: 'No reports found for this project' });
        }
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getReportById = async (req, res) => {
    try {
        const report = await PracticeReport.findById(req.params.id)
            .populate({ path: 'projectId', select: 'name' });
        if (!report) return res.status(404).json({ error: 'Report not found' });
        res.json(report);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPdf = async (req, res) => {
    const { projectId, startDate, endDate } = req.query;

    if (!projectId || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    // Fetch records from DB
    const records = await PracticeReport.find({
        projectId,
        date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        }
    }).sort({ date: 1 })
        .populate({ path: 'projectId', select: 'name' });

    // Format records for PDF
    const formattedRecords = records.map(r => ({
        date: moment(r.date).format('YYYY-MM-DD'),
        totalCost: r.totalCost,
        remarks: r.remarks || '',
        items: [
            ...(r.manpower || []).map(m => ({
                type: 'Manpower',
                category: m.category ? m.category : "--",
                description: m.description,
                qty: `${m.count} ${m.typeOfCount === "hour" ? "mem" : m.typeOfCount}`,
                rate: `${m.baseFare}/${m.quantity} ${m.typeOfCount}`,
                extraHours: m.extraHours,
                cost: m.cost,
            })),
            ...(r.machinery || []).map(m => ({
                type: 'Machinery',
                category: m.category ? m.category : "--",
                description: m.name,
                qty: `${m.usageHours} hours`,
                rate: m.ratePerHour,
                cost: m.cost
            })),
            ...(r.material || []).filter(m => m.name && m.quantity > 0).map(m => ({
                type: 'Material',
                category: m.category ? m.category : "--",
                description: m.name,
                qty: `${m.quantity} ${m.unit}`,
                rate: m.ratePerUnit || '',
                cost: m.cost
            })),
            ...(r.wastage || []).filter(w => w.item && w.quantity > 0).map(w => ({
                type: 'Wastage',
                category: "--",
                description: w.item,
                qty: `${w.quantity} ${w.unit}`,
                rate: '',
                cost: w.cost
            })),
            ...(r.other || []).map(o => ({
                type: 'Other',
                category: o.category ? o.category : "--",
                description: `${o.itemType} - ${o.description}`,
                qty: '',
                rate: '',
                cost: o.cost
            }))
        ]
    }));

    const consolidatedTotal = formattedRecords.reduce((acc, rec) => acc + rec.totalCost, 0);

    // Load and compile HTML template
    const filePath = path.join(__dirname, '../utils/work-statement.html');
    const source = fs.readFileSync(filePath, 'utf8');

    // Register custom Handlebars helpers
    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('and', (a, b) => a && b);

    const template = handlebars.compile(source);

    const html = template({
        projectName: records[0]?.projectId?.name || 'Project Name',
        startDate: moment(startDate).format('YYYY-MM-DD'),
        endDate: moment(endDate).format('YYYY-MM-DD'),
        records: formattedRecords,
        consolidatedTotal
    });

    // Render PDF with Puppeteer
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: puppeteer.executablePath(), // Ensure it uses the installed binary
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for Render/Linux
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '40px', bottom: '40px', left: '40px', right: '40px' },
    });

    await browser.close();

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=work-statement.pdf');
    res.end(pdfBuffer);
};

module.exports = { postReport, getReport, getReportById, getPdf, getReportByProjectId };
