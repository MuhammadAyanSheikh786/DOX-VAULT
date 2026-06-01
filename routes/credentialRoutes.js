const express = require('express');
const {
  createCredential,
  getCredentials,
  getCredential,
  updateCredential,
  deleteCredential,
} = require('../controllers/credentialController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware); // Protect all routes

router.post('/', createCredential);
router.get('/', getCredentials);
router.get('/:id', getCredential);
router.put('/:id', updateCredential);
router.delete('/:id', deleteCredential);

module.exports = router;