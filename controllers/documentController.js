const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');
const { DOCUMENT_CATEGORIES } = require('../config/constants');

// @desc    Upload Document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided',
      });
    }

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title and category are required',
      });
    }

    if (!DOCUMENT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${DOCUMENT_CATEGORIES.join(', ')}`,
      });
    }

    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: `securedoc/${req.userId}`,
        public_id: `${title}-${Date.now()}`,
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: 'Error uploading file to cloud storage',
            error: error.message,
          });
        }

        try {
          // Create document record
          const document = await Document.create({
            userId: req.userId,
            title,
            category,
            description: description || '',
            fileURL: result.secure_url,
            cloudinaryPublicId: result.public_id,
            fileType: result.resource_type === 'image' ? 'image' : 'pdf',
            fileSize: req.file.size,
          });

          res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            document,
          });
        } catch (dbError) {
          next(dbError);
        }
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Documents for User
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const { category } = req.query;

    let query = { userId: req.userId };

    if (category) {
      query.category = category;
    }

    const documents = await Document.find(query).sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search Documents
// @route   GET /api/documents/search?q=query
// @access  Private
exports.searchDocuments = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const documents = await Document.find(
      {
        userId: req.userId,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ],
      },
      null,
      { sort: { uploadedAt: -1 } }
    );

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Document
// @route   GET /api/documents/:id
// @access  Private
exports.getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Document
// @route   PUT /api/documents/:id
// @access  Private
exports.updateDocument = async (req, res, next) => {
  try {
    const { title, category, description } = req.body;

    let document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // If new file is uploaded, delete old one from Cloudinary
    if (req.file) {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `securedoc/${req.userId}`,
          public_id: `${title || document.title}-${Date.now()}`,
        },
        async (error, result) => {
          if (error) {
            return res.status(500).json({
              success: false,
              message: 'Error uploading file',
            });
          }

          document.fileURL = result.secure_url;
          document.cloudinaryPublicId = result.public_id;
          document.fileType = result.resource_type === 'image' ? 'image' : 'pdf';
          document.fileSize = req.file.size;
          document.title = title || document.title;
          document.category = category || document.category;
          document.description = description || document.description;
          document.updatedAt = Date.now();

          const updatedDocument = await document.save();

          res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            document: updatedDocument,
          });
        }
      );

      uploadStream.end(req.file.buffer);
    } else {
      document.title = title || document.title;
      document.category = category || document.category;
      document.description = description || document.description;
      document.updatedAt = Date.now();

      const updatedDocument = await document.save();

      res.status(200).json({
        success: true,
        message: 'Document updated successfully',
        document: updatedDocument,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(document.cloudinaryPublicId);

    // Delete from database
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};