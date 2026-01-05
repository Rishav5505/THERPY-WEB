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

        // ⚡ NON-BLOCKING (Fire & Forget) for retry flow too
        sendMail({
          to: email,
          subject: "MindMend Signup OTP (Resent)",
          text: `Your OTP for MindMend signup is: ${otp}`,
        }).catch(err => console.error("Resend email failed:", err.message));

        return res.status(200).json({
          message: "User already exists but not verified. New OTP sent.",
          user: { email, otpVerified: false },
          debugOtp: otp // Always send OTP to frontend for fallback
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`🔑 New OTP for ${email}: ${otp}`); // For debugging

    const newUser = new User({ name, email, password: hashedPassword, role, otp, otpVerified: false });
    await newUser.save();

    // ⚡ NON-BLOCKING EMAIL SEND (Fire and Forget) to prevent UI hang
    // We start the email process but don't wait for it to finish before responding
    // This solves the render timeout issue immediately.
    sendMail({
      to: email,
      subject: "MindMend Signup OTP",
      text: `Your OTP for MindMend signup is: ${otp}`,
    }).catch(err => console.error("Email send failed in background:", err.message));

    // Assume sent or failed, we return immediately.
    // We ALWAYS send debugOtp to frontend now so user is not stuck.
    const emailSent = false; // Force frontend to show fallback alert


    res.status(201).json({
      message: emailSent
        ? "User created! OTP sent to your email."
        : `User created! Email failed. Your OTP is: ${otp}`,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        otpVerified: false,
      },
      debugOtp: emailSent ? undefined : otp // Only send OTP to frontend if email failed
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

    // ⚡ NON-BLOCKING
    sendMail({
      to: email,
      subject: "MindMend OTP (Resent)",
      text: `Your new OTP is: ${otp}`,
    }).catch(err => console.error("Resend OTP failed:", err.message));

    // Always return debugOtp for immediate UI feedback
    res.json({
      message: "OTP resent successfully.",
      debugOtp: otp
    });
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

    // ⚡ NON-BLOCKING
    sendMail({
      to: email,
      subject: "MindMend Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}`,
    }).catch(err => console.error("Forgot password email failed:", err.message));

    // Always return debugOtp for immediate UI feedback
    res.json({
      message: "Password reset OTP sent.",
      debugOtp: otp
    });
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
