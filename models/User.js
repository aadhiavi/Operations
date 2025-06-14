const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  tradeId: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value) {
        return /^\d{3,5}$/.test(value);
      },
      message: 'Trade ID must be between 3 and 5 digits long.'
    }
  },
  name: { type: String, required: true, unique: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: { type: String, required: true },
  profilePic: {
    type: String,
    default: null
  },
  profilePicId: {
    type: String,
    default: null
  },

  // Temporary password support
  temporaryPassword: { type: String, default: null },
  temporaryPasswordExpires: { type: Date, default: null },

  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,

  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  isBlocked: {
    type: Boolean,
    default: false
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;


