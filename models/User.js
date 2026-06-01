const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validateCNIC, validateEmail, validatePassword } = require('../utils/validators');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },
    cnic: {
      type: String,
      required: [true, 'CNIC is required'],
      unique: true,
      validate: {
        validator: validateCNIC,
        message: 'Invalid CNIC format. Use format: XXXXX-XXXXXXX-X',
      },
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      validate: {
        validator: validateEmail,
        message: 'Invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
      validate: {
        validator: validatePassword,
        message:
          'Password must contain uppercase, lowercase, number, and special character',
      },
    },
    profilePictureURL: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);