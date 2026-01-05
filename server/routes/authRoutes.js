const express = require("express");
const router = express.Router();
const { signup, login, listTherapists, verifyOtp, resendOtp, forgotPassword, resetPassword, getUser } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.get("/therapists", listTherapists);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/user/:id", getUser);

module.exports = router;
