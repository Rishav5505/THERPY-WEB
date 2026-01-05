const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getLeaderboard } = require("../controllers/gamificationController");

// ✅ Get Leaderboard
router.get("/leaderboard", auth, getLeaderboard);

module.exports = router;
