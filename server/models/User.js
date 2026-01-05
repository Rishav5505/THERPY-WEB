const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["patient", "therapist"], required: true },
  photoUrl: { type: String }, // Profile photo URL
  bio: { type: String, default: "" },
  interests: [{ type: String }],
  specializations: [{ type: String }], // Specifically for therapists
  otp: { type: String }, // OTP for email verification
  otpVerified: { type: Boolean, default: false }, // Email verified status

  // 🎖️ Gamification Fields
  points: { type: Number, default: 0 },
  badges: [{
    name: String,
    icon: String,
    dateEarned: { type: Date, default: Date.now }
  }],
  currentStreak: { type: Number, default: 0 },
  lastMoodLogDate: { type: Date },
  totalSessionsCompleted: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
