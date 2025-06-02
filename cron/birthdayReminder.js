const cron = require('node-cron');
const { sendBirthdayWish, notifyAdmin } = require('../config/mailer');
const Employee = require('../models/Employee');
const { formatDate } = require('../utils/formatUtils');

const checkBirthdays = async () => {
    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    try {
        const employees = await Employee.aggregate([
            {
                $project: {
                    name: 1,
                    email: 1,
                    dob: 1,
                    day: { $dayOfMonth: '$dob' },
                    month: { $month: '$dob' }
                }
            },
            {
                $match: {
                    day: todayDate,
                    month: todayMonth
                }
            }
        ]);
        if (employees.length === 0) {
            console.log('No birthdays today.');
            return;
        }
        const birthdayUsers = [];
        for (const user of employees) {
            const formattedDob = formatDate(user.dob);

            await sendBirthdayWish(user.email, user.name, '', formattedDob);
            birthdayUsers.push({
                name: user.name,
                email: user.email,
                dob: formattedDob
            });
        }

        let adminMessage = '🎉 The following users have birthdays today:\n\n';
        birthdayUsers.forEach(user => {
            adminMessage += `👤 Name: ${user.name}\n📅 DOB: ${user.dob}\n📧 Email: ${user.email}\n\n`;
        });

        await notifyAdmin('🎈 Birthday Reminder', adminMessage);
        console.log('Birthday wishes sent and admin notified.');
    } catch (error) {
        console.error('Error checking birthdays:', error);
    }
};

const startBirthdayReminder = () => {
    cron.schedule('0 11 * * *', () => {
        console.log('Running daily birthday check...');
        checkBirthdays();
    });
};

module.exports = { startBirthdayReminder };

