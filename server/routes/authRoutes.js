const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Optional: Protected route to verify user token and fetch current user profile
router.get("/me", protect, (req, res) => {
  res.status(200).json(req.user);
});

module.exports = router;
