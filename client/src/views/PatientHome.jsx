import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../api/axios"; // ✅ Use configured instance
import Skeleton from "../components/Skeleton"; // 🦴 Loading Skeletons

import { io } from "socket.io-client"; // ✅ Import Socket.IO Client
import { requestNotificationPermission, notifySessionConfirmed } from "../utils/notifications"; // 🔔 Notifications

const PatientHome = () => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const username = user?.name || "Patient";
    const [bookings, setBookings] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    const [reviewForm, setReviewForm] = useState({ rating: 5, review: "" });
    const [loading, setLoading] = useState(true);
    const [isZenMode, setIsZenMode] = useState(false); // 🧘 Zen Mode State
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false); // 💊 Prescription Modal
    const [currentPrescription, setCurrentPrescription] = useState(null); // 💊 Current Prescription Data
    const [forumMessages, setForumMessages] = useState([]); // 💬 Real Forum Data

    const cards = [
        { title: "Mood Tracker", icon: "🧠", path: "mood", color: "from-green-400 to-emerald-600", desc: "Log your emotions." },
        { title: "Book Therapy", icon: "📅", path: "book", color: "from-blue-400 to-indigo-600", desc: "Expert consultation." },
        { title: "Community Forum", icon: "💬", path: "forum", color: "from-purple-400 to-fuchsia-600", desc: "Share anonymously." },
        { title: "Self Help", icon: "📘", path: "selfhelp", color: "from-orange-400 to-red-600", desc: "Wellness library." },
        { title: "Zen Library", icon: "🎵", path: "meditation", color: "from-indigo-600 to-purple-600", desc: "Curated playlists." },
        { title: "AI Chatbot", icon: "🤖", path: "chatbot", color: "from-cyan-400 to-blue-600", desc: "24/7 AI companion." },
        { title: "Help Center", icon: "🚨", path: "emergency", color: "from-rose-400 to-red-700", desc: "Crisis support." },
    ];

    const stats = [
        { label: "Mindful Days", value: "12", icon: "☀️", color: "text-orange-500" },
        { label: "Wellness Score", value: "88%", icon: "⭐", color: "text-emerald-500" },
        { label: "Hours Slept", value: "7.5h", icon: "🌙", color: "text-indigo-500" },
        { label: "Active Logs", value: "24", icon: "📈", color: "text-purple-500" }
    ];

    useEffect(() => {
        fetchBookings();

        // 🔔 Request notification permission
        requestNotificationPermission();

        // 🔔 Socket.IO Real-time Updates
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

        socket.on("booking_updated", (updatedBooking) => {
            console.log("🔔 Booking update received:", updatedBooking);

            // Update UI
            setBookings(prev => prev.map(b => b._id === updatedBooking._id ? { ...b, status: updatedBooking.status } : b));

            // 🔔 Show notification if confirmed
            if (updatedBooking.status === 'confirmed') {
                const booking = bookings.find(b => b._id === updatedBooking._id);
                if (booking) {
                    notifySessionConfirmed(
                        booking.therapist?.name || "Your Doctor",
                        booking.date,
                        booking.time
                    );
                }
            }
        });

        fetchForumMessages();

        return () => socket.disconnect();
    }, []);

    const fetchForumMessages = async () => {
        try {
            const res = await axios.get("/forum");
            // Take only latest 3
            setForumMessages(res.data.slice(0, 3));
        } catch (err) {
            console.error("Error fetching forum for feed:", err);
        }
    };

    const fetchBookings = async () => {
        try {
            // ✅ Simplified: instance handles BaseURL and Token
            const res = await axios.get("/bookings");
            setBookings(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching bookings:", err);
            setLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            // ✅ Simplified: instance handles BaseURL and Token
            await axios.post(`/bookings/${currentBookingId}/review`, reviewForm);

            setShowReviewModal(false);
            setReviewForm({ rating: 5, review: "" });
            alert("Review submitted successfully! Thank you.");
            fetchBookings(); // Refresh to update UI
        } catch (err) {
            console.error("Review failed:", err);
            alert("Failed to submit review.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase tracking-wider">Confirmed ✓</span>
            case 'completed': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-wider">Completed 🎉</span>
            case 'rejected': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase tracking-wider">Cancelled ✕</span>
            default: return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-black uppercase tracking-wider">Pending ⏳</span>
        }
    }

    return (
        <div className="space-y-10 relative">
            {/* Top Section: Welcome & Daily Quote */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-gradient-to-br from-indigo-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <h1 className="text-4xl font-black text-white tracking-tight mb-4 relative z-10">
                        Glad you're here, <span className="text-indigo-400">{username}</span>. ✨
                    </h1>
                    <p className="text-indigo-100/70 text-lg font-medium max-w-lg relative z-10">
                        "Small steps every day lead to big changes. You’re doing better than you think."
                    </p>
                    <div className="mt-8 flex gap-3 relative z-10">
                        <Link to="mood" className="px-6 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
                            Log Today's Mood
                        </Link>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col justify-center text-center"
                >
                    <div className="text-4xl mb-4 text-emerald-500">🌿</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Daily Affirmation</h3>
                    <p className="text-slate-700 dark:text-slate-300 font-bold italic text-lg leading-relaxed">
                        "I am worthy of peace, patience, and a calm mind."
                    </p>
                </motion.div>
            </div>

            {/* 📅 APPOINTMENTS SECTION - NEW */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-indigo-50 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        📅 Your Appointments
                    </h2>
                    <Link to="book" className="group relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <span className="relative px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all">Book New +</span>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Skeleton className="h-64" repeat={3} />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                        <p className="text-slate-500 font-medium">No appointments yet. Start your journey today!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking, idx) => (
                            <motion.div
                                key={booking._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-7 bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 dark:border-slate-800 relative group hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-300"
                            >
                                <div className="absolute top-6 right-6">
                                    {getStatusBadge(booking.status)}
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-black overflow-hidden border-2 border-white dark:border-slate-700 shadow-sm">
                                        {booking.therapist?.photoUrl ? (
                                            <img
                                                src={`${socketUrl}${booking.therapist.photoUrl}`}
                                                alt={booking.therapist.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            booking.therapist?.name?.[0] || "D"
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{booking.therapist?.name || "Therapist"}</h4>
                                        <p className="text-xs text-indigo-500 uppercase tracking-wider font-extrabold truncate max-w-[150px]">
                                            {booking.therapist?.specializations?.length > 0
                                                ? booking.therapist.specializations[0]
                                                : "Specialist"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    <p>📅 <span className="ml-2 text-slate-800 dark:text-slate-200">{booking.date}</span></p>
                                    <p>⏰ <span className="ml-2 text-slate-800 dark:text-slate-200">{booking.time}</span></p>
                                </div>

                                {booking.status === 'completed' && !booking.review && (
                                    <button
                                        onClick={() => {
                                            setCurrentBookingId(booking._id);
                                            setShowReviewModal(true);
                                        }}
                                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        ⭐ Leave a Review
                                    </button>
                                )}
                                {booking.status === 'confirmed' && (
                                    <Link
                                        to={`/patient/video-call/${booking._id}`}
                                        className="block w-full text-center py-3 bg-rose-500 text-white rounded-xl font-black shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-colors animate-pulse mb-2"
                                    >
                                        🎥 Join Live Session
                                    </Link>
                                )}
                                {(booking.status === 'completed' || booking.status === 'confirmed') && (
                                    <button
                                        onClick={() => {
                                            setShowPrescriptionModal(true);
                                            setCurrentPrescription({
                                                doctor: booking.therapist?.name || "Dr. Unknown",
                                                medicine: "Paracetamol",
                                                dosage: "500mg",
                                                frequency: "2x Daily",
                                                instructions: "Take after meals with water"
                                            });
                                        }}
                                        className="w-full py-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold shadow-md hover:bg-emerald-200 transition-colors mb-2 flex items-center justify-center gap-2"
                                    >
                                        💊 View Prescription
                                    </button>
                                )}
                                {booking.review && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-bold rounded-xl text-center">
                                        You rated this {booking.rating}/5 ⭐
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm text-center"
                    >
                        <div className="text-2xl mb-2">{stat.icon}</div>
                        <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* 🎖️ GAMIFICATION SECTION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-[2.5rem] border border-purple-100 dark:border-purple-800"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                        🎖️ Your Achievements
                    </h2>
                    <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
                        Level 3 🔥
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Wellness Journey</span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">68% Complete</span>
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "68%" }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                    </div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: "🎯", label: "First Session", unlocked: true, color: "from-blue-400 to-cyan-400" },
                        { icon: "🔥", label: "7-Day Streak", unlocked: true, color: "from-orange-400 to-red-400" },
                        { icon: "🧠", label: "Mood Master", unlocked: true, color: "from-green-400 to-emerald-400" },
                        { icon: "⭐", label: "5-Star Review", unlocked: false, color: "from-yellow-400 to-amber-400" },
                        { icon: "💪", label: "Wellness Warrior", unlocked: false, color: "from-purple-400 to-pink-400" },
                        { icon: "🏆", label: "Champion", unlocked: false, color: "from-indigo-400 to-purple-400" },
                    ].map((badge, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: badge.unlocked ? 1.05 : 1 }}
                            className={`p-4 rounded-2xl text-center transition-all ${badge.unlocked
                                ? `bg-gradient-to-br ${badge.color} shadow-lg`
                                : "bg-slate-100 dark:bg-slate-800 opacity-40"
                                }`}
                        >
                            <div className={`text-3xl mb-2 ${badge.unlocked ? "" : "grayscale"}`}>{badge.icon}</div>
                            <p className={`text-xs font-black uppercase tracking-wider ${badge.unlocked ? "text-white" : "text-slate-400"
                                }`}>
                                {badge.label}
                            </p>
                            {badge.unlocked && (
                                <div className="mt-2 text-[10px] font-bold text-white/80">Unlocked ✓</div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Points Display */}
                <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm">
                    <div className="text-center">
                        <div className="text-2xl font-black text-purple-600 dark:text-purple-400">1,240</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Points</div>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-300 dark:bg-slate-600"></div>
                    <div className="text-center">
                        <div className="text-2xl font-black text-pink-600 dark:text-pink-400">Top 15%</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leaderboard</div>
                    </div>
                </div>
            </motion.div>

            {/* 💬 LIVE FORUM FEED - NEW */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-purple-50 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        💬 Live Community Feed
                    </h2>
                    <Link to="forum" className="text-sm font-black text-indigo-600 hover:underline">View All →</Link>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <Skeleton className="h-16" repeat={3} />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {forumMessages.length > 0 ? (
                                forumMessages.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.02 }}
                                        className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col gap-1"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{msg.username || "Anonymous"}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-1 italic">"{msg.message}"</p>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm font-medium italic p-4">Waiting for community sparks...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="space-y-6">
                <div className="flex justify-between items-center ml-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Self-Care Toolkit</h2>
                    <div className="h-[2px] flex-1 mx-6 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="group"
                        >
                            <Link to={card.path} className="block h-full">
                                <div className={`h-full bg-gradient-to-br ${card.color} p-8 rounded-[2.5rem] shadow-lg group-hover:shadow-2xl transition-all border border-white/10`}>
                                    <div className="text-4xl mb-6 bg-white/20 w-16 h-16 flex items-center justify-center rounded-[1.5rem] backdrop-blur-md shadow-inner">{card.icon}</div>
                                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{card.title}</h3>
                                    <p className="text-white/80 text-sm font-bold leading-relaxed">{card.desc}</p>
                                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-white font-black text-xs uppercase tracking-widest">
                                        Launch Now
                                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* REVIEW MODAL */}
            <AnimatePresence>
                {showReviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-sm w-full shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Rate Your Session</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                            className={`text-4xl transition-transform hover:scale-110 ${star <= reviewForm.rating ? "text-yellow-400" : "text-slate-200"}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="How was your experience?"
                                    rows="3"
                                    value={reviewForm.review}
                                    onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                                    required
                                />
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowReviewModal(false)}
                                        className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 💊 PRESCRIPTION MODAL */}
            <AnimatePresence>
                {showPrescriptionModal && currentPrescription && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                        onClick={() => setShowPrescriptionModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    💊 Your Prescription
                                </h3>
                                <button
                                    onClick={() => setShowPrescriptionModal(false)}
                                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl">
                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Prescribed By</p>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{currentPrescription.doctor}</p>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medicine</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">{currentPrescription.medicine}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Dosage</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{currentPrescription.dosage}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{currentPrescription.frequency}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Instructions</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{currentPrescription.instructions}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowPrescriptionModal(false)}
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-lg hover:scale-[1.02] transition-transform"
                                >
                                    Got It
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🧘 ZEN MODE FLOATING BUTTON */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsZenMode(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center text-3xl z-40 border-4 border-white/20 hover:shadow-emerald-500/50 transition-shadow"
                title="Enter Zen Mode"
            >
                🧘
            </motion.button>

            {/* 🌌 ZEN MODE OVERLAY */}
            <AnimatePresence>
                {isZenMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-gradient-to-b from-teal-900 via-emerald-900 to-slate-900 flex flex-col items-center justify-center text-white overflow-hidden"
                    >
                        {/* Background Elements */}
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                        {/* Breathing Circle Animation */}
                        <motion.div
                            animate={{
                                scale: [1, 1.5, 1.5, 1],
                                opacity: [0.5, 0.8, 0.8, 0.5],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                                times: [0, 0.4, 0.6, 1]
                            }}
                            className="w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl absolute"
                        />

                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="w-48 h-48 rounded-full border-4 border-emerald-200/30 flex items-center justify-center backdrop-blur-sm relative z-10"
                        >
                            <motion.p
                                key="text"
                                animate={{ opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
                                className="text-2xl font-black tracking-widest uppercase text-emerald-100"
                            >
                                Breathe
                            </motion.p>
                        </motion.div>

                        <div className="mt-12 text-center relative z-10 p-4">
                            <h2 className="text-3xl font-light mb-2">Find Your Center</h2>
                            <p className="text-emerald-200/70 text-lg">Inhale limitlessly. Exhale fear.</p>
                        </div>

                        <button
                            onClick={() => setIsZenMode(false)}
                            className="mt-12 px-8 py-3 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-widest z-10"
                        >
                            Exit Zen Mode
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientHome;
