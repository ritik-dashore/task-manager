const mongoose = require('mongoose');
const Task = require('../models/Task');

const allowedFields = new Set(['title', 'description', 'priority', 'status', 'dueDate']);
const priorities = new Set(['Low', 'Medium', 'High']);
const statuses = new Set(['Pending', 'Completed']);

function validateTaskInput(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Request body must be a JSON object.');
    error.status = 400;
    throw error;
  }
  const fields = Object.keys(body);
  if (!fields.length) {
    const error = new Error('Provide at least one task field to update.');
    error.status = 400;
    throw error;
  }
  const unknown = fields.filter(field => !allowedFields.has(field));
  if (unknown.length) {
    const error = new Error(`Unsupported field${unknown.length > 1 ? 's' : ''}: ${unknown.join(', ')}.`);
    error.status = 400;
    throw error;
  }
  if (!partial && !Object.prototype.hasOwnProperty.call(body, 'title')) {
    const error = new Error('A task title is required.');
    error.status = 400;
    throw error;
  }
  const clean = { ...body };
  if (Object.prototype.hasOwnProperty.call(clean, 'title')) {
    if (typeof clean.title !== 'string' || !clean.title.trim() || clean.title.trim().length > 120) {
      const error = new Error('Title must be a non-empty string of 120 characters or fewer.');
      error.status = 400;
      throw error;
    }
    clean.title = clean.title.trim();
  }
  if (Object.prototype.hasOwnProperty.call(clean, 'description')) {
    if (typeof clean.description !== 'string' || clean.description.length > 2000) {
      const error = new Error('Description must be a string of 2,000 characters or fewer.');
      error.status = 400;
      throw error;
    }
    clean.description = clean.description.trim();
  }
  if (Object.prototype.hasOwnProperty.call(clean, 'priority') && !priorities.has(clean.priority)) {
    const error = new Error('Priority must be Low, Medium, or High.');
    error.status = 400;
    throw error;
  }
  if (Object.prototype.hasOwnProperty.call(clean, 'status') && !statuses.has(clean.status)) {
    const error = new Error('Status must be Pending or Completed.');
    error.status = 400;
    throw error;
  }
  if (Object.prototype.hasOwnProperty.call(clean, 'dueDate') && clean.dueDate !== null) {
    const dueDate = new Date(clean.dueDate);
    if ((typeof clean.dueDate !== 'string' && typeof clean.dueDate !== 'number' && !(clean.dueDate instanceof Date)) || Number.isNaN(dueDate.getTime())) {
      const error = new Error('Due date must be a valid date or null.');
      error.status = 400;
      throw error;
    }
    clean.dueDate = dueDate;
  }
  return clean;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseListQuery(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 50 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    const error = new Error('Page must be a positive integer and limit must be between 1 and 100.');
    error.status = 400;
    throw error;
  }
  if (query.status && !statuses.has(query.status)) {
    const error = new Error('Status filter must be Pending or Completed.');
    error.status = 400;
    throw error;
  }
  if (query.priority && !priorities.has(query.priority)) {
    const error = new Error('Priority filter must be Low, Medium, or High.');
    error.status = 400;
    throw error;
  }
  if (query.sort !== undefined && typeof query.sort !== 'string') {
    const error = new Error('Sort must be a single valid sort value.');
    error.status = 400;
    throw error;
  }
  const [sortBy = 'createdAt', order = 'desc', extra] = (query.sort || 'createdAt:desc').split(':');
  if (extra || !['createdAt', 'dueDate'].includes(sortBy) || !['asc', 'desc'].includes(order)) {
    const error = new Error('Sort must be createdAt:asc, createdAt:desc, dueDate:asc, or dueDate:desc.');
    error.status = 400;
    throw error;
  }
  if (query.search && (typeof query.search !== 'string' || query.search.length > 100)) {
    const error = new Error('Search must be 100 characters or fewer.');
    error.status = 400;
    throw error;
  }
  return { page, limit, sortBy, order };
}

async function getTasks(req, res) {
  const { page, limit, sortBy, order } = parseListQuery(req.query);
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.priority) filter.priority = req.query.priority;
  if (req.query.search?.trim()) {
    const expression = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    filter.$or = [{ title: expression }, { description: expression }];
  }
  const sort = { [sortBy]: order === 'asc' ? 1 : -1, _id: 1 };
  const [tasks, total, totalTasks, pending, completed] = await Promise.all([
    Task.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).lean(),
    Task.countDocuments(filter),
    Task.countDocuments(),
    Task.countDocuments({ status: 'Pending' }),
    Task.countDocuments({ status: 'Completed' }),
  ]);
  res.json({
    success: true,
    data: {
      tasks,
      stats: { total: totalTasks, pending, completed },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
}

async function getTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  return res.json({ success: true, data: { task } });
}

async function createTask(req, res) {
  const task = await Task.create(validateTaskInput(req.body));
  return res.status(201).json({ success: true, data: { task } });
}

async function updateTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
  const updates = validateTaskInput(req.body, { partial: true });
  const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  return res.json({ success: true, data: { task } });
}

async function deleteTask(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid task ID.' });
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  return res.json({ success: true, data: { task: { id: task.id } }, message: 'Task deleted.' });
}

module.exports = { createTask, deleteTask, getTask, getTasks, updateTask };
