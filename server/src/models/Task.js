const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A task title is required.'],
    trim: true,
    minlength: [1, 'A task title is required.'],
    maxlength: [120, 'Task titles cannot exceed 120 characters.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Descriptions cannot exceed 2,000 characters.'],
    default: '',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending',
  },
  dueDate: {
    type: Date,
    default: null,
  },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Task', taskSchema);
