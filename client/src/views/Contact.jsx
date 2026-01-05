import { useState } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const res = await axios.post("/contact/send", formData);
      setStatus({ type: "success", message: res.data.message || "Message sent successfully! ✨" });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.response?.data?.message || "Something went wrong! Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] pt-32 pb-20 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -ml-48 -mt-20" />

        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6"
          >
            We're here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">listen.</span>
          </motion.h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Have questions about our therapy programs or technology?
            Drop us a message and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <div className="glass p-10 rounded-[2.5rem] space-y-8">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">Support Channels</h3>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📧</div>
                <div>
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Email Support</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">support@mindmend.com</p>
                  <p className="text-sm text-slate-500 font-medium">Expected response: 24h</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm">📍</div>
                <div>
                  <p className="text-xs font-black text-purple-600 uppercase tracking-widest mb-1">Office HQ</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">Wellness Park, Suite 402</p>
                  <p className="text-sm text-slate-500 font-medium">San Francisco, CA 94103</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-rose-50 dark:bg-rose-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🚨</div>
                <div>
                  <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Emergency 24/7</p>
                  <p className="text-xl font-bold text-slate-700 dark:text-slate-300">+1 (800) MIND-MEND</p>
                  <p className="text-sm text-slate-500 font-medium">Immediate assistance</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h4 className="text-2xl font-black mb-4 relative z-10">Follow Our Journey</h4>
              <p className="text-slate-400 font-medium mb-6 relative z-10">Join our growing community on social media for daily wellness tips and news.</p>
              <div className="flex gap-4 relative z-10">
                {['𝕏', '📸', '📽️', '💼'].map(icon => (
                  <button key={icon} className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-center text-xl">
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 shadow-2xl shadow-indigo-500/10 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-6">
              {status.message && (
                <div className={`p-4 rounded-2xl font-bold text-center ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {status.message}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Your Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  rows="5"
                  className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-2 border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-800 transition-all font-bold outline-none resize-none"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send Message 🚀"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
