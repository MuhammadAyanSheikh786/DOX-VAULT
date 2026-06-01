const mongoose = require('mongoose');
const { DOCUMENT_CATEGORIES } = require('../config/constants');

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
    },
    category: {
      type: String,
      enum: {
        values: DOCUMENT_CATEGORIES,
        message: `Category must be one of: ${DOCUMENT_CATEGORIES.join(', ')}`,
      },
      required: [true, 'Document category is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    fileURL: {
      type: String,
      required: [true, 'File URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image'],
    },
    fileSize: {
      type: Number, // in bytes
    },
    uploadedAt: {
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

// Create index for faster search
documentSchema.index({ userId: 1, title: 'text', category: 1 });

module.exports = mongoose.model('Document', documentSchema);