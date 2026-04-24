const Note = require('../Note');

// @desc    Get notes (user's own, admin gets all)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;

    // Build query filter
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(filter)
        .populate('user', 'name email')
        .sort({ isPinned: -1, updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Note.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: notes.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      notes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notes.' });
  }
};

// @desc    Get single note
// @route   GET /api/notes/:id
// @access  Private
const getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id).populate('user', 'name email');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Only owner or admin can view
    if (note.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this note' });
    }

    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch note.' });
  }
};

// @desc    Create note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, content, tags, color, isPinned } = req.body;

    const note = await Note.create({
      title,
      content,
      tags: tags || [],
      color: color || '#ffffff',
      isPinned: isPinned || false,
      user: req.user._id
    });

    await note.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create note.' });
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Only owner or admin can update
    if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }

    const { title, content, tags, color, isPinned } = req.body;

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, content, tags, color, isPinned },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to update note.' });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    // Only owner or admin can delete
    if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete note.' });
  }
};

// @desc    Toggle pin status
// @route   PATCH /api/notes/:id/pin
// @access  Private
const togglePin = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    note.isPinned = !note.isPinned;
    await note.save();
    await note.populate('user', 'name email');

    res.json({ success: true, message: `Note ${note.isPinned ? 'pinned' : 'unpinned'}`, note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle pin.' });
  }
};

module.exports = { getNotes, getNote, createNote, updateNote, deleteNote, togglePin };
