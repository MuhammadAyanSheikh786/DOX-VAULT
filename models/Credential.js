const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const credentialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }, 
    title: {
      type: String,
      required: [true, 'Credential title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username/Key is required'],
    },
    password: {
      type: String,
      required: [true, 'Password/Value is required'],
      set: (value) => encrypt(value), // Encrypt on save
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
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

// Method to get decrypted password
credentialSchema.methods.getDecryptedPassword = function () {
  return decrypt(this.password);
};

module.exports = mongoose.model('Credential', credentialSchema);