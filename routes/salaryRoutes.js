const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth');
const {
    getAllUsers,
    createFixedSalary,
    getFixedSalary,
    getFixedSalaryByUser,
    createPayroll,
    getPayslip,
    getPayslipPdf,
    getPayData,
    updateFixedSalaryByUserId,
    getPayDataByUserId,
    submitPayroll,
    saveDraftPayroll,
    getDraftPayrolls,
    getFinalPayrolls
} = require('../controllers/salaryController');
const { getHolidaysByYear, setHolidayConfig, updateHolidayForMonth } = require('../controllers/holidayController');

router.get('/salary', authenticate, isAdmin, getAllUsers);
// router.get('/salary/:id/personal', authenticate, isAdmin, getSalaryDetails);
// router.post('/salary/:id/personal', authenticate, isAdmin, createSalaryDetails);
// router.put('/salary/:id/personal', authenticate, isAdmin, updateSalaryDetails);
// router.get('/me/salary/:id', authenticate, getMySalaryDetails);
// router.get('/all-salary', authenticate, isAdmin, getAllSalary);
router.post('/create-holyday', setHolidayConfig);
router.get('/get-holydays/:year', getHolidaysByYear);
router.patch('/update-holyday/:year', updateHolidayForMonth);

router.post('/salary-fixed', createFixedSalary)
router.get('/salary-fixed', authenticate, isAdmin, getFixedSalary)
router.get('/salary-fixed/:id', authenticate, isAdmin, getFixedSalaryByUser);
router.put('/salary-fixed/:userId', updateFixedSalaryByUserId);

router.post('/draft-payroll/:userId', authenticate, isAdmin, saveDraftPayroll);
router.get('/draft-payrolls', authenticate, isAdmin, getDraftPayrolls);
router.post('/salary-payroll/:userId', authenticate, isAdmin, submitPayroll);
router.get('/payroll/final', authenticate, isAdmin, getFinalPayrolls);
router.get('/salary-payroll', getPayslip);
// router.get('/payroll-data', getPayData);
router.get('/payslip/pdf', getPayslipPdf);
router.get('/payroll-data/:userId', getPayDataByUserId);


module.exports = router;

