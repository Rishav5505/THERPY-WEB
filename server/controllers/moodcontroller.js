const Mood = require("../models/Mood");
const { awardPoints, updateStreak } = require("./gamificationController");

exports.addMood = async (req, res) => {
  try {
    const { mood, note } = req.body;
    const userId = req.user.id;      // auth middleware sets req.user
    const newMood = await Mood.create({ mood, note, user: userId });

    // 🎖️ GAMIFICATION: Award points for logging mood
    await awardPoints(userId, 10, "logging your mood", req.io);

    // 🔥 GAMIFICATION: Update streak
    await updateStreak(userId, req.io);

    res.status(201).json(newMood);
  } catch (err) {
    console.error("Add Mood error:", err);
    res.status(500).json({ message: "Could not save mood", error: err.message });
  }
};

exports.getMoods = async (req, res) => {
  try {
    const userId = req.user.id;
    const moods = await Mood.find({ user: userId }).sort({ createdAt: -1 });
    res.json(moods);
  } catch (err) {
    console.error("Get Moods error:", err);
    res.status(500).json({ message: "Failed to fetch moods" });
  }
};
