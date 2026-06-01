const express = require('express');
const {
  uploadDocument,
  getDocuments,
  searchDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/multerConfig');

const router = express.Router();

router.use(authMiddleware); // Protect all routes

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);
router.put('/:id', upload.single('file'), updateDocument);
router.delete('/:id', deleteDocument);

module.exports = router;