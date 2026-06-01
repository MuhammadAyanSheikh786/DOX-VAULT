const Credential = require('../models/Credential');

// @desc    Create Credential
// @route   POST /api/credentials
// @access  Private
exports.createCredential = async (req, res, next) => {
  try {
    const { title, username, password, category } = req.body;

    if (!title || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Title, username, and password are required',
      });
    }

    const credential = await Credential.create({
      userId: req.userId,
      title,
      username,
      password, // Will be encrypted by model's setter
      category: category || 'General',
    });

    res.status(201).json({
      success: true,
      message: 'Credential created successfully',
      credential: {
        id: credential._id,
        title: credential.title,
        username: credential.username,
        category: credential.category,
        createdAt: credential.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Credentials
// @route   GET /api/credentials
// @access  Private
exports.getCredentials = async (req, res, next) => {
  try {
    const credentials = await Credential.find({ userId: req.userId }).sort({
      createdAt: -1,
    });

    // Return without decrypted passwords for list view
    const credentialsWithoutPasswords = credentials.map((cred) => ({
      id: cred._id,
      title: cred.title,
      username: cred.username,
      category: cred.category,
      createdAt: cred.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: credentials.length,
      credentials: credentialsWithoutPasswords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Single Credential with Decrypted Password
// @route   GET /api/credentials/:id
// @access  Private
exports.getCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    res.status(200).json({
      success: true,
      credential: {
        id: credential._id,
        title: credential.title,
        username: credential.username,
        password: credential.getDecryptedPassword(),
        category: credential.category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Credential
// @route   PUT /api/credentials/:id
// @access  Private
exports.updateCredential = async (req, res, next) => {
  try {
    const { title, username, password, category } = req.body;

    const credential = await Credential.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    credential.title = title || credential.title;
    credential.username = username || credential.username;
    if (password) credential.password = password;
    credential.category = category || credential.category;
    credential.updatedAt = Date.now();

    const updatedCredential = await credential.save();

    res.status(200).json({
      success: true,
      message: 'Credential updated successfully',
      credential: {
        id: updatedCredential._id,
        title: updatedCredential.title,
        username: updatedCredential.username,
        category: updatedCredential.category,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Credential
// @route   DELETE /api/credentials/:id
// @access  Private
exports.deleteCredential = async (req, res, next) => {
  try {
    const credential = await Credential.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!credential) {
      return res.status(404).json({
        success: false,
        message: 'Credential not found',
      });
    }

    await Credential.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Credential deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};