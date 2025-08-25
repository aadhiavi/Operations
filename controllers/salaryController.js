const Payroll = require('../models/PayRoll');
const SalaryFixed = require('../models/SalaryFixed');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const handlebars = require('handlebars');
const Employee = require('../models/Employee');
const inWords = require('inr-words');
const { sendPaySlip } = require('../config/mailer');


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};
const createFixedSalary = async (req, res) => {
  try {
    const { name, tradeId, userId } = req.body;
    const existing = await SalaryFixed.findOne({ userId, tradeId, name });
    if (existing) {
      return res.status(409).json({ message: 'Salary for this user already exists' });
    }
    const salaryDetails = new SalaryFixed({
      userId,
      tradeId,
      name,
      ...req.body
    });

    await salaryDetails.save();

    res.status(201).json({ message: 'Salary created', salaryDetails });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating salary record' });
  }
};
const updateFixedSalaryByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const updated = await SalaryFixed.findOneAndUpdate(
      { userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Salary record not found for user' });
    }

    res.status(200).json({ message: 'Salary updated successfully', salaryDetails: updated });
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Server error updating salary' });
  }
};
const getFixedSalary = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.find();
    const allUsers = await User.find({}, 'tradeId');
    const validTradeIds = new Set(allUsers.map(u => u.tradeId));
    const filteredSalary = fixedSalary.filter(s => validTradeIds.has(s.tradeId));

    res.status(200).json(filteredSalary);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fixed salary' });
  }
};
const getFixedSalaryByUser = async (req, res) => {
  try {
    const fixedSalary = await SalaryFixed.findOne({ userId: req.params.id });
    if (!fixedSalary) return res.status(404).json({ message: 'Fixed salary not found' });
    res.status(200).json(fixedSalary);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fixed salary' });
  }
};



const saveDraftPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.body;

    let draft = await Payroll.findOne({ userId, month, year, isDraft: true });

    if (draft) {
      Object.assign(draft, req.body);
      await draft.save();
      return res.status(200).json({ message: 'Draft updated', draft });
    }
    draft = new Payroll({ userId, ...req.body, isDraft: true });
    await draft.save();
    res.status(201).json({ message: 'Draft saved', draft });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Server error saving draft' });
  }
};
const getDraftPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const drafts = await Payroll.find({ month, year, isDraft: true });
    res.status(200).json(drafts);
  } catch (error) {
    console.error('Fetch drafts error:', error);
    res.status(500).json({ message: 'Server error fetching drafts' });
  }
};
const submitPayroll = async (req, res) => {
  try {
    const { userId } = req.params;
    const { month, year } = req.body;

    // Find existing draft
    let draft = await Payroll.findOne({ userId, month, year, isDraft: true });

    if (draft) {
      draft.isDraft = false; // finalize payroll
      await draft.save();
      return res.status(200).json({ message: 'Payroll submitted from draft', payroll: draft });
    }

    // If no draft, create new final payroll
    const payroll = new Payroll({ userId, ...req.body, isDraft: false });
    await payroll.save();
    res.status(201).json({ message: 'Payroll submitted', payroll });
  } catch (error) {
    console.error('Submit payroll error:', error);
    res.status(500).json({ message: 'Server error submitting payroll' });
  }
};


// const getPayData = async (req, res) => {
//   try {
//     const payroll = await Payroll.find();
//     if (!payroll) {
//       return res.status(404).json({ message: 'Payroll not found' });
//     }
//     res.status(200).json(payroll);
//   } catch (error) {
//     console.error('Error fetching payroll data:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

const getFinalPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ message: 'Month and year required' });

    const finalPayrolls = await Payroll.find({ month, year, isDraft: false });
    res.status(200).json(finalPayrolls);
  } catch (error) {
    console.error('Fetch final payrolls error:', error);
    res.status(500).json({ message: 'Server error fetching final payrolls' });
  }
};



const getPayDataByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const payroll = await Payroll.find({ userId });
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found for user' });
    }
    res.status(200).json(payroll);
  } catch (error) {
    console.error('Error fetching payroll data by user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getPayslip = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'userId, month, and year are required' });
    }

    const [payroll, fixedSalary, user, employee] = await Promise.all([
      Payroll.findOne({ userId, month, year }),
      SalaryFixed.findOne({ userId }),
      User.findById(userId),
      Employee.findOne({ user: userId }),
    ]);

    if (!payroll || !fixedSalary || !user || !employee) {
      return res.status(404).json({ message: 'Required data not found' });
    }

    const { totalDays = 30, payableDays = 30 } = payroll;

    // Utility to calculate earned salary
    const calculateEarned = (standard) =>
      parseFloat(((standard / totalDays) * payableDays).toFixed(2));

    const earnings = {
      basic: {
        standard: fixedSalary.basicMonthly,
        earned: calculateEarned(fixedSalary.basicMonthly),
      },
      hra: {
        standard: fixedSalary.hraMonthly,
        earned: calculateEarned(fixedSalary.hraMonthly),
      },
      conveyance: {
        standard: fixedSalary.caMonthly,
        earned: calculateEarned(fixedSalary.caMonthly),
      },
      medical: {
        standard: fixedSalary.maMonthly,
        earned: calculateEarned(fixedSalary.maMonthly),
      },
      specialAllowance: {
        standard: fixedSalary.saMonthly,
        earned: calculateEarned(fixedSalary.saMonthly),
      },
      bonus: {
        standard: fixedSalary.bonusMonthly || 0,
        earned: fixedSalary.bonusMonthly || 0,
      },
    };

    const deductions = {
      pf: fixedSalary.employeePFMonthly || 0,
      esi: fixedSalary.esiEmployee || 0,
      tax: fixedSalary.taxMonthly || 0,
      other: payroll.deduction || 0,
    };

    const totalEarnings = Object.values(earnings).reduce(
      (sum, val) => sum + (val.earned || 0),
      0
    );

    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netPay = totalEarnings - totalDeductions;

    const payslipJSON = {
      employee: {
        name: employee.name,
        tradeId: employee.tradeId,
        bankAccount: employee.accountNo || 'N/A',
        bankName: employee.bankName || 'N/A',
        doj: employee.doj ? employee.doj.toISOString().split('T')[0] : 'N/A',
        designation: employee.designation || 'N/A',
        location: employee.city || 'N/A',
        esi: employee.esiNo || 'N/A',
        uan: employee.uan || 'N/A',
      },
      payrollInfo: {
        month,
        year,
        totalDays,
        payableDays,
        present: payroll.present,
        absent: payroll.absent,
        weekOffs: payroll.sundays,
        holidays: payroll.holidays,
        allowedLeaves: payroll.allowedLeaves,
      },
      earnings,
      deductions,
      totals: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPay: parseFloat(netPay.toFixed(2)),
      },
    };

    return res.status(200).json(payslipJSON);
  } catch (error) {
    console.error('Error fetching payslip JSON:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPayslipPdf = async (req, res) => {
  try {
    const { userId, month, year } = req.query;

    if (!userId || !month || !year) {
      return res.status(400).json({ message: 'Missing userId, month, or year' });
    }

    const [payroll, fixedSalary, user, employee] = await Promise.all([
      Payroll.findOne({ userId, month, year }),
      SalaryFixed.findOne({ userId }),
      User.findById(userId),
      Employee.findOne({ user: userId }),
    ]);


    if (!payroll || !fixedSalary || !user || !employee) {
      return res.status(404).json({ message: 'Required data not found' });
    }

    const { totalDays, payableDays } = payroll;

    // Prorate only components that vary with attendance
    const prorateComponent = (value) => {
      const dailyRate = value / totalDays;
      const earned = dailyRate * payableDays;
      return parseFloat(earned.toFixed(2));
    };

    // Earnings: some components are prorated, others fixed
    const earnings = {
      basic: {
        standard: fixedSalary.basicMonthly || 0,
        earned: prorateComponent(fixedSalary.basicMonthly || 0),
      },
      hra: {
        standard: fixedSalary.hraMonthly || 0,
        earned: prorateComponent(fixedSalary.hraMonthly || 0),
      },
      conveyance: {
        standard: fixedSalary.caMonthly || 0,
        earned: prorateComponent(fixedSalary.caMonthly || 0),
      },
      medical: {
        standard: fixedSalary.maMonthly || 0,
        earned: prorateComponent(fixedSalary.maMonthly || 0), // ✅ Now correctly prorated
      },
      specialAllowance: {
        standard: fixedSalary.saMonthly || 0,
        earned: prorateComponent(fixedSalary.saMonthly || 0),
      },
      bonus: {
        standard: fixedSalary.bonusMonthly || 0,
        earned: fixedSalary.bonusMonthly || 0, // bonus still fixed unless told otherwise
      },
    };


    const deductions = {
      pf: fixedSalary.employeePFMonthly || 0,
      esi: fixedSalary.esiEmployee || 0,
      tax: fixedSalary.taxMonthly || 0,
      other: payroll.deduction || 0,
    };

    // Totals
    const totalEarnings = Object.values(earnings).reduce((sum, comp) => sum + (comp.earned || 0), 0);
    const totalStandard = Object.values(earnings).reduce((sum, comp) => sum + (comp.standard || 0), 0);
    const totalDeductions = Object.values(deductions).reduce((sum, val) => sum + val, 0);
    const netPay = parseFloat((totalEarnings - totalDeductions).toFixed(2));

    const netPayWords = inWords(netPay) + ' Only';

    // Prepare HTML template
    const templatePath = path.join(__dirname, '../utils/payslip-template.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(source);

    // Register helper to calculate standard total
    handlebars.registerHelper('sumStandard', (earnings) => {
      return Object.values(earnings).reduce((sum, val) => sum + val.standard, 0).toFixed(2);
    });

    handlebars.registerHelper('formatINR', function (amount) {
      if (typeof amount !== 'number') return '₹0.00';

      return `₹${amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    });


    const html = template({
      employee: {
        name: employee.name,
        tradeId: employee.tradeId,
        bankAccount: employee.accountNo || 'N/A',
        bankName: employee.bankName || 'N/A',
        doj: employee.doj ? employee.doj.toISOString().split('T')[0] : 'N/A',
        designation: employee.designation || 'N/A',
        location: employee.city || 'N/A',
        esi: employee.esiNo || 'N/A',
        uan: employee.uan || 'N/A',
      },
      payrollInfo: {
        month,
        year,
        totalDays,
        payableDays,
      },
      earnings,
      deductions,
      totals: {
        totalEarnings: parseFloat(totalEarnings.toFixed(2)),
        totalStandard: parseFloat(totalStandard.toFixed(2)),
        totalDeductions: parseFloat(totalDeductions.toFixed(2)),
        netPay,
        netPayWords
      },
    });

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '40px', bottom: '20px', left: '20px', right: '20px' },
    });

    await browser.close();

    await sendPaySlip(
      user.email,
      employee.name,
      employee.tradeId,
      month,
      year,
      pdfBuffer
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${user.name}_payslip_${month}_${year}.pdf`
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error('PDF Generation Error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllUsers,
  createFixedSalary,
  getFixedSalary,
  getFixedSalaryByUser,
  saveDraftPayroll,
  getDraftPayrolls,
  submitPayroll,
  getPayslip,
  getPayslipPdf,
  // getPayData,
  getFinalPayrolls,
  updateFixedSalaryByUserId,
  getPayDataByUserId
};
