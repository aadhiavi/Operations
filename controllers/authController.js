const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOtp, sendOtp, setTemporaryPassword } = require('../utils/otp');
const { sendOtpEmail, sendWelcomeEmail, sendCreateAlerEmail } = require('../config/mailer');
const User = require('../models/User');
const SalaryFixed = require('../models/SalaryFixed');


// const adminCreateUser = async (req, res) => {
//     const { name, email, tradeId, role } = req.body;

//     try {
//         const existingUser = await User.findOne({ $or: [{ email }, { tradeId }] });
//         if (existingUser) return res.status(400).json({ message: 'User already exists' });

//         const tempPassword = '12345';
//         const hashedPassword = await bcrypt.hash(tempPassword, 12);

//         const user = new User({
//             name,
//             email,
//             tradeId,
//             password: hashedPassword,
//             role,
//             isVerified: true 
//         });

//         // Set temp password for future enforcement
//         user.temporaryPassword = hashedPassword;
//         user.temporaryPasswordExpires = Date.now() + 7 * 24 * 60 * 60 * 1000;
//         await user.save();
//         await sendCreateAlerEmail(email, name, tradeId);
//         res.status(201).json({ message: 'User created successfully with temp password 12345' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server error' });
//     }
// };


const adminCreateUser = async (req, res) => {
    const { name, email, tradeId, role } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { tradeId }] });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const tempPassword = '12345';
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        const user = new User({
            name,
            email,
            tradeId,
            password: hashedPassword,
            role,
            temporaryPassword: hashedPassword,
            temporaryPasswordExpires: Date.now() + 7 * 24 * 60 * 60 * 1000
        });

        // Automatically set isVerified based on temporaryPassword field
        user.isVerified = user.temporaryPassword ? false : true;

        await user.save();

        await sendCreateAlerEmail(email, name, tradeId);

        res.status(201).json({ message: 'User created successfully with temp password 12345' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


// Register User
const registerUser = async (req, res) => {
    const { name, email, password, tradeId } = req.body;

    try {
        const existingUser = await User.findOne({ email, tradeId });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ name, email, password: hashedPassword, tradeId });
        await newUser.save();
        // Generate OTP
        const otp = generateOtp();
        newUser.otp = otp;
        newUser.otpExpires = Date.now() + 600000;
        await newUser.save();
        await sendOtp(email, otp);
        res.status(201).json({ message: 'Account created. Please verify your email with OTP.' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Verify OTP for registaration
const verifyOtpRegistration = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        await sendWelcomeEmail(email, user.name, user.tradeId);
        res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const loginUser = async (req, res) => {
    const { tradeId, password } = req.body;
    if (!tradeId || !password) {
        return res.status(400).json({ message: 'Trade ID and password are required' });
    }
    try {
        const user = await User.findOne({ tradeId });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        if (user.isBlocked) return res.status(403).json({ message: 'Your account is blocked. Please contact HR.' });
        const now = Date.now();
        // Check permanent password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        // Check temporary password if regular fails
        const isTempPasswordValid = user.temporaryPassword &&
            user.temporaryPasswordExpires > now &&
            await bcrypt.compare(password, user.temporaryPassword);
        if (!isPasswordCorrect && !isTempPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Please verify your email first or Ask HR to verify email' });
        }
        // Optional: force user to reset password if using temp one
        const requiresPasswordReset = isTempPasswordValid;

        const token = jwt.sign(
            {
                userId: user._id,
                tradeId: user.tradeId,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '9h' }
        );

        res.json({ token, requiresPasswordReset });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const assignTemporaryPassword = async (req, res) => {
    const { tradeId } = req.body;
    try {
        const user = await User.findOne({ tradeId });
        if (!user) return res.status(404).json({ message: 'User not found' });

        try {
            await setTemporaryPassword(user);
        } catch (err) {
            console.error('Error in setTemporaryPassword:', err);
            return res.status(500).json({ message: 'Failed to set temporary password' });
        }

        res.status(200).json({ message: 'Temporary password "12345" has been assigned. It will expire in 24 hours.' });
    } catch (error) {
        console.log('Error in assignTemporaryPassword:', error);
        res.status(500).json({ message: 'Server error' });
    }
};




// Forgot Password
const forgotPassword = async (req, res) => {
    const { email, tradeId } = req.body;
    try {
        const user = await User.findOne({ email, tradeId });
        if (!user) return res.status(400).json({ message: 'User not found' });
        console.log(user)
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000;
        await user.save();
        await sendOtpEmail(email, otp);
        res.status(200).json({ message: 'OTP sent to your email for password reset' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Resend OTP
const resendOtp = async (req, res) => {
    const { email, tradeId } = req.body;
    try {
        const user = await User.findOne({ email, tradeId });
        if (!user) return res.status(400).json({ message: 'User not found' });
        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 600000;
        await user.save();
        await sendOtp(tradeId, email, otp);
        res.status(200).json({ message: 'OTP resent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { tradeId, email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({ email, tradeId });
        if (!user) return res.status(400).json({ message: 'User not found' });

        if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
        if (user.otpExpires < Date.now()) return res.status(400).json({ message: 'OTP expired' });

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpires = null;

        // Clear temp password if previously set
        user.temporaryPassword = null;
        user.temporaryPasswordExpires = null;

        await user.save();
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get User Profile
const getUser = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users) {
            return res.status(404).json({ message: 'No users found' });
        }
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Edit User
const editUsers = async (req, res) => {
    const { name, email, tradeId, role } = req.body;
    const userId = req.params.id;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { name, email, tradeId, role }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const isBlockedUser = async (req, res) => {
    const { id } = req.params;
    const { isBlocked } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isBlocked },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully.`,
            updatedUser,
        });
    } catch (error) {
        console.error('Error updating block status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Route: POST /admin/impersonate
const adminImpersonate = async (req, res) => {
    const { tradeId } = req.body;

    try {
        const user = await User.findOne({ tradeId });
        if (!user) return res.status(404).json({ message: 'User not found' });
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '60m' }
        );
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete fixed salary records associated with the user
        await SalaryFixed.deleteMany({ tradeId: user.tradeId });

        res.status(200).json({ message: 'User and associated fixed salary deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};



module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resendOtp,
    resetPassword,
    getUser,
    getAllUsers,
    editUsers,
    verifyOtpRegistration,
    assignTemporaryPassword,
    adminCreateUser,
    adminImpersonate,
    isBlockedUser,
    deleteUser
};
