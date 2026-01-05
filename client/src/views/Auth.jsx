import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [resetData, setResetData] = useState({ email: "", otp: "", newPassword: "" });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await axios.post("/auth/login", {
          email: form.email,
          password: form.password,
          role: form.role
        });
        const user = res.data.user;
        const token = res.data.token;
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));

        if (user.role === "therapist") {
          sessionStorage.setItem("therapistId", user._id);
          setSuccess("Welcome back, Doctor! Redirecting...");
          setTimeout(() => navigate("/therapist/appointments"), 1200);
        } else {
          setSuccess("Welcome back! Redirecting to your health dashboard...");
          setTimeout(() => navigate("/patient"), 1200);
        }
      } else {
        res = await axios.post("/auth/signup", form);
        setSuccess(res.data.message || "Account created! OTP sent to your email.");
        setOtpMode(true);
        setPendingEmail(form.email);

        // For developer eyes only - no more annoying alerts!
        if (res.data.debugOtp) {
          console.log(`🔑 Debug OTP: ${res.data.debugOtp}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Server might be waking up.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("/auth/verify-otp", { email: pendingEmail, otp });
      setSuccess("Account verified! You can now login.");
      setOtpMode(false);
      setIsLogin(true);
      setForm({ ...form, email: pendingEmail });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await axios.post("/auth/resend-otp", { email: pendingEmail });
      setSuccess("New OTP sent to your email!");
      if (res.data.debugOtp) {
        console.log(`🔑 Resent Debug OTP: ${res.data.debugOtp}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("/auth/forgot-password", { email: resetData.email });
      setSuccess("Reset OTP sent to your email!");
      setResetPasswordMode(true);
      setForgotPasswordMode(false);

      if (res.data.debugOtp) {
        console.log(`🔑 Forgot Password Debug OTP: ${res.data.debugOtp}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post("/auth/reset-password", resetData);
      setSuccess("Password reset successful! You can now login.");
      setResetPasswordMode(false);
      setIsLogin(true);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10 flex items-center justify-center bg-slate-50 dark:bg-[#0b0f1a] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-800/50 p-10 rounded-[3rem] shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-800 backdrop-blur-xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
            {forgotPasswordMode ? "Recover Account" : resetPasswordMode ? "New Password" : otpMode ? "Check Email" : isLogin ? "Welcome Back" : "Start Healing"}
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            {isLogin ? "Join the community or manage your care." : "Create an account to begin your journey."}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold text-center border border-rose-100 shadow-sm"
          >
            {error}
            {error.includes("Email not verified") && !otpMode && (
              <button
                className="mt-3 block mx-auto px-6 py-2 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg"
                onClick={() => {
                  setOtpMode(true);
                  setPendingEmail(form.email);
                  setError("");
                  setSuccess("");
                }}
              >
                Verify Now
              </button>
            )}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-600 font-bold text-center border border-emerald-100 shadow-sm"
          >
            {success}
          </motion.div>
        )}

        {forgotPasswordMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-6">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm"
              value={resetData.email}
              onChange={(e) => setResetData({ ...resetData, email: e.target.value })}
              required
            />
            <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[1.5rem] font-black shadow-xl hover:scale-[1.02] transition-transform">Get Reset Code</button>
            <button type="button" onClick={() => setForgotPasswordMode(false)} className="w-full text-indigo-600 font-bold text-sm">Return to Login</button>
          </form>
        ) : resetPasswordMode ? (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <input
              type="text"
              placeholder="6-digit OTP"
              className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm text-center tracking-[0.5em]"
              value={resetData.otp}
              onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="New Secure Password"
              className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm"
              value={resetData.newPassword}
              onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
              required
            />
            <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:scale-[1.02] transition-transform">Update Password</button>
          </form>
        ) : otpMode ? (
          <form onSubmit={handleOtpVerify} className="space-y-8 text-center">
            <p className="text-slate-500 font-medium text-sm">Verify your email: <br /><b className="text-slate-900 dark:text-white">{pendingEmail}</b></p>
            <input
              type="text"
              placeholder="••••••"
              className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm text-center text-4xl tracking-[0.5em]"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              maxLength={6}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black shadow-xl hover:scale-[1.02] transition-transform"
            >
              Verify My Account
            </button>
            <div className="flex justify-center gap-6 text-sm">
              <button type="button" onClick={handleResendOtp} className="text-indigo-600 font-bold hover:underline">Resend OTP</button>
              <button type="button" onClick={() => setOtpMode(false)} className="text-slate-400 font-bold hover:underline">Change Email</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-[1.8rem] mb-4">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "patient" })}
                className={`flex-1 py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all ${form.role === 'patient' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                I am a Patient
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "therapist" })}
                className={`flex-1 py-3 rounded-[1.2rem] font-black text-xs uppercase tracking-widest transition-all ${form.role === 'therapist' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
              >
                I am a Doctor
              </button>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Display Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Dr. John Doe"
                  className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm"
                  onChange={handleChange}
                  value={form.name}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="Your official email"
                className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm"
                onChange={handleChange}
                required
                value={form.email}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min 8 characters"
                  className="w-full p-5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-400 outline-none font-bold transition-all shadow-sm pr-14"
                  onChange={handleChange}
                  value={form.password}
                  required
                />
                <span
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-2xl cursor-pointer"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            {isLogin && (
              <p
                className="text-right text-xs text-indigo-600 font-bold cursor-pointer hover:underline"
                onClick={() => {
                  setForgotPasswordMode(true);
                  setResetData({ ...resetData, email: form.email });
                }}
              >
                Lost your password?
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[1.5rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-transform active:scale-95 ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
            >
              {loading ? "Processing..." : (isLogin ? "Unlock Dashboard" : "Create Account")}
            </button>
          </form>
        )}

        {!otpMode && !forgotPasswordMode && !resetPasswordMode && (
          <p className="mt-8 text-center text-sm font-bold text-slate-500">
            {isLogin ? "New to the platform?" : "Welcome back?"} {" "}
            <span
              className="text-indigo-600 cursor-pointer hover:underline"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccess("");
              }}
            >
              {isLogin ? "Join MindMend" : "Sign In instead"}
            </span>
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
