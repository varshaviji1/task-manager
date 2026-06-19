const express = require("express");
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Apply protection middleware to all task routes
router.use(protect);

// Routes mapping for task CRUD operations
router.route("/")
  .post(createTask)
  .get(getTasks);

router.route("/:id")
  .get(getTaskById)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
