const User = require('../models/User');
const Note = require('../models/Note');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Get note counts per user
    const userIds = users.map(u => u._id);
    const noteCounts = await Note.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);

    const noteCountMap = {};
    noteCounts.forEach(nc => { noteCountMap[nc._id.toString()] = nc.count; });

    const usersWithNotes = users.map(u => ({
      ...u.toJSON(),
      noteCount: noteCountMap[u._id.toString()] || 0
    }));

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users: usersWithNotes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
};

// @desc    Get single user (admin only)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const noteCount = await Note.countDocuments({ user: user._id });
    res.json({ success: true, user: { ...user.toJSON(), noteCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be user or admin.' });
    }

    // Prevent admin from demoting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update role.' });
  }
};

// @desc    Toggle user active status (admin only)
// @route   PATCH /api/users/:id/status
// @access  Admin
const toggleUserStatus = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate yourself.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

// @desc    Delete user and their notes (admin only)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete yourself.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete all notes belonging to this user
    await Note.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and all their notes deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
};

// @desc    Get notes of a specific user (admin only)
// @route   GET /api/users/:id/notes
// @access  Admin
const getUserNotes = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const notes = await Note.find({ user: req.params.id })
      .populate('user', 'name email')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user notes.' });
  }
};

module.exports = { getAllUsers, getUserById, updateUserRole, toggleUserStatus, deleteUser, getUserNotes };
