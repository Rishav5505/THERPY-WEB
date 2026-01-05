import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // ✅ Use configured instance
import { io } from "socket.io-client"; // ✅ Import socket.io-client
import { requestNotificationPermission, notifyNewBooking } from "../utils/notifications"; // 🔔 Notifications
import Skeleton from "../components/Skeleton"; // 🦴 Loading Skeletons

const TherapistHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: "Total Patients", value: "0", icon: "👥", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
        { label: "Appointments Today", value: "0", icon: "📅", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
        { label: "Consultation Hours", value: "0", icon: "⏱️", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
        { label: "Pending Requests", value: "0", icon: "📩", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
    ]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Data from Backend
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axios.get("/bookings/therapist"); // ✅ Use streamlined path
                const bookings = res.data;

                // 1. Calculate Stats
                const uniquePatients = new Set(bookings.map(b => b.user?._id)).size;
                const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
                const todayAppointments = bookings.filter(b => b.date === today && b.status !== 'cancelled').length;
                const totalHours = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length; // Approx 1 hr per session
                const pendingCount = bookings.filter(b => b.status === 'pending').length;

                setStats([
                    { label: "Total Patients", value: uniquePatients.toString(), icon: "👥", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
                    { label: "Appointments Today", value: todayAppointments.toString(), icon: "📅", color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
                    { label: "Consultation Hours", value: totalHours.toString() + "+", icon: "⏱️", color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
                    { label: "Pending Requests", value: pendingCount.toString(), icon: "📩", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
                ]);

                // 2. Pending Requests List
                const pending = bookings.filter(b => b.status === 'pending').map(b => ({
                    id: b._id,
                    name: b.user?.name || "Unknown User",
                    issue: b.notes || "General Consultation", // Fallback if notes empty
                    time: `Requested for ${b.date} @ ${b.time}`,
                    img: b.user?.photoUrl ? `${import.meta.env.VITE_SOCKET_URL}${b.user.photoUrl}` : null,
                    therapistId: b.therapist
                }));
                // Sort by newest first
                setPendingRequests(pending.reverse());

                // 3. Next Upcoming Appointment
                const upcoming = bookings
                    .filter(b => b.status === 'confirmed' && new Date(b.date + 'T' + b.time) > new Date())
                    .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))[0];

                if (upcoming) {
                    setNextAppointment({
                        id: upcoming._id,
                        name: upcoming.user?.name,
                        time: `${upcoming.date} @ ${upcoming.time}`,
                        type: upcoming.notes ? "Follow-up" : "General Checkup",
                        image: upcoming.user?.photoUrl ? `${import.meta.env.VITE_SOCKET_URL}${upcoming.user.photoUrl}` : null,
                        notes: upcoming.notes || "No pre-session notes provided."
                    });
                } else {
                    setNextAppointment(null);
                }

                setIsLoading(false);

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setIsLoading(false);
            }
        };

        fetchDashboardData();

        // 🔔 Request notification permission
        requestNotificationPermission();

        // 🔗 SETUP REAL-TIME LISTENER
        const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");

        socket.on("new_booking", (booking) => {
            // Retrieve current therapist ID to filter irrelevant events
            const userStr = sessionStorage.getItem("user");
            const currentUser = userStr ? JSON.parse(userStr) : null;

            if (currentUser && booking.therapist === currentUser._id) {
                console.log("🔔 New Booking Received via Socket!", booking);

                // 🔔 Show browser notification
                notifyNewBooking(booking.user?.name || 'a patient');

                // Update Pending Requests UI
                setPendingRequests(prev => [
                    {
                        id: booking._id,
                        name: booking.user?.name || "New Patient",
                        issue: booking.notes || "New Request",
                        time: `Requested for ${booking.date} @ ${booking.time}`,
                        img: booking.user?.photoUrl ? `${import.meta.env.VITE_SOCKET_URL}${booking.user.photoUrl}` : null
                    },
                    ...prev
                ]);

                // Update Stats Counter
                setStats(prev => {
                    const newStats = [...prev];
                    newStats[3].value = (parseInt(newStats[3].value) + 1).toString();
                    return newStats;
                });
            }
        });

        return () => {
            socket.disconnect();
        }

    }, []);

    const handleAction = async (id, action) => {
        let status;
        if (action === 'Accept') status = 'confirmed';
        else if (action === 'Reject') status = 'rejected';
        else if (action === 'Complete') status = 'completed';

        const confirmMsg = action === 'Complete'
            ? "Mark this session as completed?"
            : `Are you sure you want to ${action} this request?`;

        if (window.confirm(confirmMsg)) {
            try {
                // ✅ Simplified call
                await axios.put(`/bookings/${id}/status`, { status });

                if (action === 'Complete') {
                    setNextAppointment(null); // Clear active session
                    alert("Session marked as completed!");
                } else {
                    // Update Pending List
                    setPendingRequests(prev => prev.filter(req => req.id !== id));
                    setStats(prev => {
                        const newStats = [...prev];
                        newStats[3].value = (parseInt(newStats[3].value) - 1).toString();
                        return newStats;
                    });
                }
            } catch (error) {
                console.error("Error updating status:", error);
                alert("Failed to update status. Please try again.");
            }
        }
    };

    if (isLoading) return (
        <div className="space-y-8 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-32" repeat={4} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <Skeleton className="xl:col-span-2 h-96" />
                <Skeleton className="h-96" />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">

            {/* 📊 STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 transition-shadow relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-indigo-500/10 transition-colors" />
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-2xl ${stat.color} text-2xl`}>
                                {stat.icon}
                            </div>
                            <span className="text-3xl font-black text-slate-800 dark:text-white">{stat.value}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* 🩺 UPCOMING SESSION CARD */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="xl:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[3rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden group border border-white/10"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/15 transition-colors duration-700" />

                    {nextAppointment ? (
                        <>
                            <div className="flex flex-col md:flex-row justify-between items-start mb-8 relative z-10 gap-6 md:gap-0">
                                <div>
                                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-sm font-bold mb-3 border border-white/30">
                                        ⚡ Up Next
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-black">Session with {nextAppointment.name}</h2>
                                    <p className="text-indigo-100 font-medium opacity-90">{nextAppointment.type} • {nextAppointment.time}</p>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    {nextAppointment.image ? (
                                        <img src={nextAppointment.image} alt="patient" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white/20 shadow-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">👤</div>
                                    )}
                                    <button
                                        onClick={() => handleAction(nextAppointment.id, 'Complete')}
                                        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm transition-colors border border-white/30 font-bold flex items-center gap-1"
                                    >
                                        ✓ Mark Complete
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/10 mb-8 relative z-10">
                                <p className="text-sm font-bold text-indigo-200 uppercase tracking-widest mb-2">Notes</p>
                                <p className="text-base md:text-lg leading-relaxed">{nextAppointment.notes}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <button
                                    onClick={() => navigate('/therapist/video-call')}
                                    className="flex-1 bg-white text-indigo-700 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 active:scale-95 transform"
                                >
                                    🎥 Start Video Call
                                </button>
                                <button
                                    onClick={() => navigate('/therapist/session-notes')}
                                    className="px-6 py-4 bg-indigo-800/50 text-white rounded-xl font-bold hover:bg-indigo-800/70 transition-colors border border-indigo-500/30 active:scale-95 transform"
                                >
                                    📝 History
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center py-10">
                            <div className="text-6xl mb-4">💤</div>
                            <h3 className="text-2xl font-black">No Upcoming Sessions</h3>
                            <p className="text-indigo-200">You are all caught up for now!</p>
                        </div>
                    )}
                </motion.div>

                {/* 📩 PENDING REQUESTS */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-800"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white">New Patients</h3>
                        <span className="text-indigo-500 font-bold text-sm">
                            {pendingRequests.length} Pending
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {pendingRequests.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-8 text-slate-400"
                                >
                                    <p className="text-4xl mb-2">✨</p>
                                    <p className="font-medium">All caught up!</p>
                                </motion.div>
                            ) : (
                                pendingRequests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors group"
                                    >
                                        {req.img ? (
                                            <img src={req.img} alt={req.name} className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xl">👤</div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{req.name}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{req.time}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(req.id, 'Accept')}
                                                className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors shadow-sm"
                                                title="Accept"
                                            >
                                                ✓
                                            </button>
                                            <button
                                                onClick={() => handleAction(req.id, 'Reject')}
                                                className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shadow-sm"
                                                title="Reject"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daily Focus</p>
                        <p className="text-sm italic text-slate-600 dark:text-slate-300">
                            "Compassion is not a relationship between the healer and the wounded. It's a relationship between equals."
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* 📅 QUICK SCHEDULE OVERVIEW - Scrollable */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Today's Schedule</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                    {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time, i) => (
                        <div key={i} className={`min-w-[150px] p-4 rounded-2xl border flex-shrink-0 bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700`}>
                            <p className="text-xs font-bold opacity-70 mb-1">{time}</p>
                            <p className="font-bold text-lg">Available</p>
                            <p className="text-[10px] uppercase tracking-wider font-bold mt-2">---</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🛠️ DEBUG BUTTON (Remove in Production) */}
            <div className="text-center opacity-50 hover:opacity-100 transition-opacity">
                <button
                    onClick={() => {
                        const token = sessionStorage.getItem("token");
                        axios.get("/bookings/therapist") // Streamlined call
                            .then(res => {
                                alert(`DEBUG: Fetched ${res.data.length} bookings.\n\nFirst booking status: ${res.data[0]?.status || 'N/A'}\nUser: ${res.data[0]?.user?.name || 'N/A'}`);
                                console.log("Full Data:", res.data);
                            }).catch(err => alert("Fetch Error: " + err.message));
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-600 rounded text-xs font-mono"
                >
                    🐞 Debug Dashboard Data
                </button>
            </div>

        </div>
    );
};

export default TherapistHome;
