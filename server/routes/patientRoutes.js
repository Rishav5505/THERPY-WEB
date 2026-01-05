
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const User = require("../models/User");
const Mood = require("../models/Mood");
const SessionNote = require("../models/SessionNote");
const multer = require("multer");
const path = require("path");
const patientController = require("../controllers/patientController");

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Upload patient profile photo
router.post("/:id/photo", upload.single("photo"), patientController.uploadPhoto);

// ✅ Therapist ke sare patients
router.get("/by-therapist/:therapistId", async (req, res) => {
  try {
    const therapistId = req.params.therapistId;
    console.log("➡ Therapist ID:", therapistId);
    const bookings = await Booking.find({ therapist: therapistId });
    console.log("📒 Bookings found:", bookings.length);
    if (!bookings || bookings.length === 0) {
      console.log("⚠️ No bookings found for therapist.");
      return res.json([]);
    }
    const patientIds = [...new Set(bookings.map(b => b.user.toString()))];
    console.log("🆔 Patient IDs:", patientIds);
    const patients = await User.find({
      _id: { $in: patientIds }
    }).select("name email createdAt photoUrl");
    console.log("👥 Patients found:", patients.length);
    res.json(patients);
  } catch (error) {
    console.error("❌ Server error in /by-therapist:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📊 GET Patient Progress Data (Mood History + Session Stats)
router.get("/:patientId/progress", async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query; // Default last 30 days

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 1. Get Mood History
    const moods = await Mood.find({
      user: patientId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // 2. Get Session/Booking History
    const sessions = await Booking.find({
      user: patientId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // 3. Get Session Notes
    const sessionNotes = await SessionNote.find({
      patient: patientId,
      date: { $gte: startDate }
    }).sort({ date: -1 }).populate("therapist", "name");

    // 4. Calculate mood statistics
    const moodCounts = {
      Happy: 0,
      Sad: 0,
      Stressed: 0,
      Angry: 0,
      Relaxed: 0
    };

    moods.forEach(m => {
      if (moodCounts[m.mood] !== undefined) {
        moodCounts[m.mood]++;
      }
    });

    // 5. Mood score mapping for trend analysis
    const moodScores = {
      Happy: 5,
      Relaxed: 4,
      Sad: 2,
      Stressed: 2,
      Angry: 1
    };

    // 6. Create daily mood trend data
    const dailyMoodData = {};
    moods.forEach(m => {
      const dateKey = new Date(m.createdAt).toISOString().split('T')[0];
      if (!dailyMoodData[dateKey]) {
        dailyMoodData[dateKey] = { scores: [], moods: [] };
      }
      dailyMoodData[dateKey].scores.push(moodScores[m.mood] || 3);
      dailyMoodData[dateKey].moods.push(m.mood);
    });

    // Calculate daily average scores
    const moodTrend = Object.entries(dailyMoodData).map(([date, data]) => ({
      date,
      avgScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      dominantMood: data.moods.sort((a, b) =>
        data.moods.filter(v => v === b).length - data.moods.filter(v => v === a).length
      )[0]
    }));

    // 7. Session statistics
    const sessionStats = {
      total: sessions.length,
      completed: sessions.filter(s => s.status === "completed").length,
      confirmed: sessions.filter(s => s.status === "confirmed").length,
      pending: sessions.filter(s => s.status === "pending").length,
      cancelled: sessions.filter(s => s.status === "cancelled" || s.status === "rejected").length
    };

    // 8. Weekly session frequency
    const weeklySessionData = {};
    sessions.forEach(s => {
      const weekStart = getWeekStart(new Date(s.createdAt));
      if (!weeklySessionData[weekStart]) {
        weeklySessionData[weekStart] = 0;
      }
      weeklySessionData[weekStart]++;
    });

    // 9. Calculate improvement score (comparing first half to second half)
    let improvementScore = 0;
    if (moodTrend.length >= 4) {
      const midpoint = Math.floor(moodTrend.length / 2);
      const firstHalfAvg = moodTrend.slice(0, midpoint).reduce((a, b) => a + b.avgScore, 0) / midpoint;
      const secondHalfAvg = moodTrend.slice(midpoint).reduce((a, b) => a + b.avgScore, 0) / (moodTrend.length - midpoint);
      improvementScore = ((secondHalfAvg - firstHalfAvg) / 5 * 100).toFixed(1);
    }

    // 10. Average ratings from completed sessions
    const completedWithRating = sessions.filter(s => s.status === "completed" && s.rating);
    const avgRating = completedWithRating.length > 0
      ? (completedWithRating.reduce((a, b) => a + b.rating, 0) / completedWithRating.length).toFixed(1)
      : null;

    res.json({
      moodHistory: moods,
      moodCounts,
      moodTrend,
      sessionStats,
      weeklySessionData: Object.entries(weeklySessionData).map(([week, count]) => ({ week, count })),
      sessionNotes,
      improvementScore: parseFloat(improvementScore),
      avgRating,
      totalMoodEntries: moods.length
    });
  } catch (error) {
    console.error("❌ Error fetching patient progress:", error);
    res.status(500).json({ message: "Error fetching patient progress" });
  }
});

// Helper function to get week start date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

// 📈 GET Patient Overview for Dashboard Cards
router.get("/:patientId/overview", async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient info
    const patient = await User.findById(patientId).select("name email photoUrl createdAt");
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Get latest mood
    const latestMood = await Mood.findOne({ user: patientId }).sort({ createdAt: -1 });

    // Get session count
    const totalSessions = await Booking.countDocuments({ user: patientId, status: "completed" });

    // Get upcoming session
    const upcomingSession = await Booking.findOne({
      user: patientId,
      status: { $in: ["confirmed", "pending"] },
      date: { $gte: new Date().toISOString().split('T')[0] }
    }).sort({ date: 1, time: 1 });

    res.json({
      patient,
      latestMood: latestMood ? { mood: latestMood.mood, date: latestMood.createdAt } : null,
      totalSessions,
      upcomingSession
    });
  } catch (error) {
    console.error("❌ Error fetching patient overview:", error);
    res.status(500).json({ message: "Error fetching patient overview" });
  }
});

module.exports = router;

