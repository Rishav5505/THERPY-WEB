const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.otpVerified) {
        return res.status(400).json({ message: "User already exists" });
      } else {
        // User exists but not verified - Update progress and resend OTP
        const hashedPassword = await bcrypt.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        existingUser.name = name;
        existingUser.password = hashedPassword;
        existingUser.role = role;
        existingUser.otp = otp;
        await existingUser.save();

        console.log(`🔑 Resent OTP for ${email}: ${otp}`); // For debugging

        try {
          await sendMail({
            to: email,
            subject: "MindMend Signup OTP (Resent)",
            text: `Your OTP for MindMend signup is: ${otp}`,
          });
        } catch (mailError) {
          console.error("❌ Mail sending failed:", mailError.message);
          return res.status(200).json({
            message: "User exists, but OTP email failed. (OTP logged in server console)",
            user: { email, otpVerified: false }
          });
        }

        return res.status(200).json({
          message: "User already exists but not verified. New OTP sent.",
          user: { email, otpVerified: false }
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 New OTP for ${email}: ${otp}`); // For debugging

    const newUser = new User({ name, email, password: hashedPassword, role, otp, otpVerified: false });
    await newUser.save();

    try {
      await sendMail({
        to: email,
        subject: "MindMend Signup OTP",
        text: `Your OTP for MindMend signup is: ${otp}`,
      });
    } catch (mailError) {
      console.error("❌ Mail sending failed:", mailError.message);
    }

    res.status(201).json({
      message: "User created! (Note: Email service is hitting Google limits. Please check your VS Code Terminal for the 6-digit OTP to verify your account).",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        otpVerified: false,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.otpVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify OTP sent to your email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "secretkey", {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// Verify OTP endpoint
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });
    if (user.otpVerified)
      return res.status(400).json({ message: "Email already verified" });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    user.otpVerified = true;
    user.otp = undefined;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification failed", error: err.message });
  }
};

// ✅ List therapists
exports.listTherapists = async (req, res) => {
  try {
    const therapists = await User.find({ role: "therapist" }).select("name _id email photoUrl specializations");
    res.json(therapists);
  } catch (err) {
    console.error("Fetch therapists error:", err);
    res.status(500).json({ message: "Failed to fetch therapists" });
  }
};

// ✅ Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otpVerified) return res.status(400).json({ message: "Already verified" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();
    console.log(`🔑 Resent OTP for ${email}: ${otp}`); // Debug

    try {
      await sendMail({
        to: email,
        subject: "MindMend OTP (Resent)",
        text: `Your new OTP is: ${otp}`,
      });
    } catch (mailError) {
      console.error("❌ Mail resend failed:", mailError.message);
    }

    res.json({ message: "OTP process completed. If email doesn't arrive in 1 min, check your Server Terminal for the code." });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP", error: err.message });
  }
};

// ✅ Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User with this email does not exist" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    await user.save();
    console.log(`🔑 Forgot Pass OTP for ${email}: ${otp}`); // Debug

    try {
      await sendMail({
        to: email,
        subject: "MindMend Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`,
      });
    } catch (mailError) {
      console.error("❌ Forgot pass mail failed:", mailError.message);
    }

    res.json({ message: "Password reset process initiated. If email doesn't arrive, check the Server Terminal for the reset code." });
  } catch (err) {
    res.status(500).json({ message: "Forgot password failed", error: err.message });
  }
};

// ✅ Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed", error: err.message });
  }
};

// ✅ Get User Profile
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", error: err.message });
  }
};
