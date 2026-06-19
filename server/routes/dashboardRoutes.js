const express = require("express");
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Protect all dashboard routes
router.use(protect);

// Route mapping for dashboard stats
router.get("/stats", getDashboardStats);

module.exports = router;
