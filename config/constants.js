const DOCUMENT_CATEGORIES = [
  'Identity',
  'Property',
  'Vehicle',
  'Education',
  'Healthcare',
  'Financial',
  'Others',
];

const ALLOWED_FILE_TYPES = ['pdf', 'jpeg', 'jpg', 'png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

module.exports = {
  DOCUMENT_CATEGORIES,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
};