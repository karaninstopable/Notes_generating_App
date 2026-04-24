const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  color: {
    type: String,
    default: '#ffffff',
    enum: ['#ffffff', '#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#ede9fe', '#fee2e2', '#ffedd5']
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, isPinned: -1 });

module.exports = mongoose.model('Note', noteSchema);
