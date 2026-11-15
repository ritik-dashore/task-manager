const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { createTask, deleteTask, getTask, getTasks, updateTask } = require('../controllers/taskController');

const router = express.Router();

router.route('/').get(asyncHandler(getTasks)).post(asyncHandler(createTask));
router.route('/:id')
  .get(asyncHandler(getTask))
  .patch(asyncHandler(updateTask))
  .delete(asyncHandler(deleteTask));

module.exports = router;
