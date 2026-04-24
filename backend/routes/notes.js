const express = require('express');
const router = express.Router();
const {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin
} = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

router.use(protect); // All note routes require authentication

router.get('/', getNotes);
router.post('/', createNote);
router.get('/:id', getNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.patch('/:id/pin', togglePin);

module.exports = router;
