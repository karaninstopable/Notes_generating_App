const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  deleteUser,
  getUserNotes
} = require('../controllers/usersController');
const { protect, authorize } = require('../middleware/auth');

// All user management routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);
router.get('/:id/notes', getUserNotes);

module.exports = router;
