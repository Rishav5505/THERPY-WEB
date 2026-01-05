// views/PatientProgress.jsx - Patient Progress Dashboard for Doctors
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://mind-mend-final-backend.onrender.com";

// Mood color mapping
const moodColors = {
    Happy: { bg: '#10B981', light: 'rgba(16, 185, 129, 0.2)' },
    Relaxed: { bg: '#6366F1', light: 'rgba(99, 102, 241, 0.2)' },
    Sad: { bg: '#3B82F6', light: 'rgba(59, 130, 246, 0.2)' },
    Stressed: { bg: '#F59E0B', light: 'rgba(245, 158, 11, 0.2)' },
    Angry: { bg: '#EF4444', light: 'rgba(239, 68, 68, 0.2)' }
};

const moodEmojis = {
    Happy: '😊',
    Relaxed: '😌',
    Sad: '😢',
    Stressed: '😰',
    Angry: '😠'
};

const PatientProgress = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressLoading, setProgressLoading] = useState(false);
    const [timeRange, setTimeRange] = useState(30);
    const [activeTab, setActiveTab] = useState('mood');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const userStr = sessionStorage.getItem("user");
            if (!userStr) return;

            const user = JSON.parse(userStr);
            const res = await axios.get(`/patients/by-therapist/${user._id}`);
            setPatients(res.data);
        } catch (error) {
            console.error("Error fetching patients:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientProgress = async (patientId) => {
        try {
            setProgressLoading(true);
            const res = await axios.get(`/patients/${patientId}/progress?days=${timeRange}`);
            setProgressData(res.data);
        } catch (error) {
            console.error("Error fetching patient progress:", error);
        } finally {
            setProgressLoading(false);
        }
    };

    const handleSelectPatient = (patient) => {
        setSelectedPatient(patient);
        fetchPatientProgress(patient._id);
    };

    useEffect(() => {
        if (selectedPatient) {
            fetchPatientProgress(selectedPatient._id);
        }
    }, [timeRange]);

    // Chart configurations
    const moodTrendChartData = {
        labels: progressData?.moodTrend?.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })) || [],
        datasets: [
            {
                label: 'Mood Score',
                data: progressData?.moodTrend?.map(d => d.avgScore) || [],
                fill: true,
                borderColor: '#6366F1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                pointBackgroundColor: progressData?.moodTrend?.map(d => moodColors[d.dominantMood]?.bg || '#6366F1') || [],
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ]
    };

    const moodTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: (context) => {
                        const mood = progressData?.moodTrend?.[context.dataIndex]?.dominantMood;
                        return `Score: ${context.raw.toFixed(1)} (${mood} ${moodEmojis[mood] || ''})`;
                    }
                }
            }
        },
        scales: {
            y: {
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1,
                    callback: (value) => {
                        const labels = ['', 'Very Low', 'Low', 'Neutral', 'Good', 'Excellent'];
                        return labels[value] || '';
                    },
                    font: { weight: '600' }
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { weight: '600' },
                    maxRotation: 45
                }
            }
        }
    };

    const moodDistributionData = {
        labels: Object.keys(progressData?.moodCounts || {}),
        datasets: [{
            data: Object.values(progressData?.moodCounts || {}),
            backgroundColor: Object.keys(progressData?.moodCounts || {}).map(mood => moodColors[mood]?.bg || '#6366F1'),
            borderColor: '#fff',
            borderWidth: 3,
            hoverOffset: 10
        }]
    };

    const moodDistributionOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 20,
                    font: { size: 12, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 12,
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.raw / total) * 100).toFixed(1);
                        return `${context.raw} entries (${percentage}%)`;
                    }
                }
            }
        }
    };

    const sessionChartData = {
        labels: progressData?.weeklySessionData?.map(d => {
            const date = new Date(d.week);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }) || [],
        datasets: [{
            label: 'Sessions',
            data: progressData?.weeklySessionData?.map(d => d.count) || [],
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderRadius: 8,
            barThickness: 40
        }]
    };

    const sessionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                padding: 12,
                cornerRadius: 12
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    font: { weight: '600' }
                },
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)'
                }
            },
            x: {
                grid: { display: false },
                ticks: { font: { weight: '600' } }
            }
        }
    };

    return (
        <div className="min-h-screen p-2">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2rem] p-8 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                📊 Patient Progress Dashboard
                            </h1>
                            <p className="text-white/70 mt-2 font-medium">
                                Track mood history, session progress & improvement metrics
                            </p>
                        </div>
                        {selectedPatient && (
                            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(parseInt(e.target.value))}
                                    className="bg-white/20 text-white border-0 rounded-xl px-4 py-2 font-bold outline-none cursor-pointer"
                                >
                                    <option value={7} className="text-slate-900">Last 7 Days</option>
                                    <option value={30} className="text-slate-900">Last 30 Days</option>
                                    <option value={60} className="text-slate-900">Last 60 Days</option>
                                    <option value={90} className="text-slate-900">Last 90 Days</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Patient List Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="w-80 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white">
                                👥 Select Patient
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {patients.length} patients in your care
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[60vh]">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : patients.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-slate-400 font-medium">No patients found</p>
                                </div>
                            ) : (
                                patients.map((patient) => (
                                    <motion.div
                                        key={patient._id}
                                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectPatient(patient)}
                                        className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer transition-all ${selectedPatient?._id === patient._id
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 border-l-4 border-l-indigo-600'
                                            : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg">
                                                {patient.photoUrl ? (
                                                    <img src={`${socketUrl}${patient.photoUrl}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-white font-black text-lg">
                                                        {patient.name?.[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-slate-900 dark:text-white truncate">
                                                    {patient.name}
                                                </h3>
                                                <p className="text-xs text-slate-500 truncate">{patient.email}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {!selectedPatient ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 text-center"
                            >
                                <div className="text-8xl mb-6">📈</div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                    Select a Patient
                                </h3>
                                <p className="text-slate-500 font-medium">
                                    Choose a patient from the list to view their progress dashboard
                                </p>
                            </motion.div>
                        ) : progressLoading ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-16 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="font-bold text-slate-500">Loading progress data...</p>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Patient Header */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-xl">
                                            {selectedPatient.photoUrl ? (
                                                <img src={`${socketUrl}${selectedPatient.photoUrl}`} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-white font-black text-3xl">
                                                    {selectedPatient.name?.[0]?.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                                                {selectedPatient.name}
                                            </h2>
                                            <p className="text-slate-500 font-medium">{selectedPatient.email}</p>
                                        </div>
                                        <div className="flex gap-4">
                                            {/* Quick Stats */}
                                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-center shadow-lg min-w-[100px]">
                                                <p className="text-3xl font-black text-white">
                                                    {progressData?.sessionStats?.completed || 0}
                                                </p>
                                                <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Sessions</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-center shadow-lg min-w-[100px]">
                                                <p className="text-3xl font-black text-white">
                                                    {progressData?.totalMoodEntries || 0}
                                                </p>
                                                <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Mood Logs</p>
                                            </div>
                                            <div className={`rounded-2xl p-4 text-center shadow-lg min-w-[100px] ${progressData?.improvementScore >= 0
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                : 'bg-gradient-to-br from-orange-500 to-red-600'
                                                }`}>
                                                <p className="text-3xl font-black text-white">
                                                    {progressData?.improvementScore > 0 ? '+' : ''}{progressData?.improvementScore || 0}%
                                                </p>
                                                <p className="text-xs text-white/80 font-bold uppercase tracking-wider">Improvement</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-2">
                                    {[
                                        { id: 'mood', label: '😊 Mood Analysis', icon: '📊' },
                                        { id: 'sessions', label: '📅 Sessions', icon: '📈' },
                                        { id: 'notes', label: '📝 Session Notes', icon: '📋' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content */}
                                <AnimatePresence mode="wait">
                                    {activeTab === 'mood' && (
                                        <motion.div
                                            key="mood"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-3 gap-6"
                                        >
                                            {/* Mood Trend Chart */}
                                            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                    📈 Mood Score Trend
                                                </h3>
                                                {progressData?.moodTrend?.length > 0 ? (
                                                    <div className="h-80">
                                                        <Line data={moodTrendChartData} options={moodTrendOptions} />
                                                    </div>
                                                ) : (
                                                    <div className="h-80 flex items-center justify-center text-slate-400">
                                                        <div className="text-center">
                                                            <div className="text-5xl mb-4">📭</div>
                                                            <p className="font-medium">No mood data available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Mood Distribution */}
                                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                    🎯 Mood Distribution
                                                </h3>
                                                {Object.values(progressData?.moodCounts || {}).some(v => v > 0) ? (
                                                    <div className="h-64">
                                                        <Doughnut data={moodDistributionData} options={moodDistributionOptions} />
                                                    </div>
                                                ) : (
                                                    <div className="h-64 flex items-center justify-center text-slate-400">
                                                        <p className="font-medium">No data</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Recent Moods */}
                                            <div className="col-span-3 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                    🕐 Recent Mood Entries
                                                </h3>
                                                <div className="grid grid-cols-5 gap-4">
                                                    {(progressData?.moodHistory?.slice(-10) || []).reverse().map((mood, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: idx * 0.05 }}
                                                            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center"
                                                        >
                                                            <div className="text-4xl mb-2">{moodEmojis[mood.mood]}</div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{mood.mood}</p>
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {new Date(mood.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                            </p>
                                                            {mood.note && (
                                                                <p className="text-xs text-slate-400 mt-2 truncate" title={mood.note}>
                                                                    "{mood.note}"
                                                                </p>
                                                            )}
                                                        </motion.div>
                                                    ))}
                                                    {(!progressData?.moodHistory || progressData.moodHistory.length === 0) && (
                                                        <div className="col-span-5 text-center py-8 text-slate-400">
                                                            <p className="font-medium">No mood entries found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'sessions' && (
                                        <motion.div
                                            key="sessions"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-3 gap-6"
                                        >
                                            {/* Session Stats Cards */}
                                            <div className="col-span-3 grid grid-cols-4 gap-4">
                                                {[
                                                    { label: 'Total Sessions', value: progressData?.sessionStats?.total || 0, color: 'from-indigo-500 to-purple-600', icon: '📊' },
                                                    { label: 'Completed', value: progressData?.sessionStats?.completed || 0, color: 'from-green-500 to-emerald-600', icon: '✅' },
                                                    { label: 'Upcoming', value: progressData?.sessionStats?.confirmed || 0, color: 'from-blue-500 to-cyan-600', icon: '📅' },
                                                    { label: 'Cancelled', value: progressData?.sessionStats?.cancelled || 0, color: 'from-orange-500 to-red-600', icon: '❌' }
                                                ].map((stat, idx) => (
                                                    <motion.div
                                                        key={stat.label}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-xl`}
                                                    >
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-3xl">{stat.icon}</span>
                                                            <span className="text-4xl font-black">{stat.value}</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-white/80 uppercase tracking-wider">{stat.label}</p>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Weekly Sessions Chart */}
                                            <div className="col-span-2 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                    📅 Weekly Session Frequency
                                                </h3>
                                                {progressData?.weeklySessionData?.length > 0 ? (
                                                    <div className="h-72">
                                                        <Bar data={sessionChartData} options={sessionChartOptions} />
                                                    </div>
                                                ) : (
                                                    <div className="h-72 flex items-center justify-center text-slate-400">
                                                        <div className="text-center">
                                                            <div className="text-5xl mb-4">📭</div>
                                                            <p className="font-medium">No session data available</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Average Rating */}
                                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6 flex flex-col items-center justify-center">
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                    ⭐ Session Rating
                                                </h3>
                                                {progressData?.avgRating ? (
                                                    <>
                                                        <div className="text-6xl mb-4">⭐</div>
                                                        <p className="text-5xl font-black text-slate-900 dark:text-white">
                                                            {progressData.avgRating}
                                                        </p>
                                                        <p className="text-slate-500 font-medium mt-2">Average Rating</p>
                                                    </>
                                                ) : (
                                                    <div className="text-center text-slate-400">
                                                        <div className="text-5xl mb-4">⭐</div>
                                                        <p className="font-medium">No ratings yet</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'notes' && (
                                        <motion.div
                                            key="notes"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 p-6"
                                        >
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6">
                                                📝 Session Notes History
                                            </h3>
                                            {progressData?.sessionNotes?.length > 0 ? (
                                                <div className="space-y-4">
                                                    {progressData.sessionNotes.map((note, idx) => (
                                                        <motion.div
                                                            key={note._id || idx}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border-l-4 border-indigo-600"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                                    {new Date(note.date).toLocaleDateString('en-US', {
                                                                        weekday: 'long',
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                                <span className="text-xs text-slate-400 font-medium">
                                                                    By: {note.therapist?.name || 'Therapist'}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                {note.note}
                                                            </p>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 text-slate-400">
                                                    <div className="text-6xl mb-4">📋</div>
                                                    <p className="font-medium text-lg">No session notes found</p>
                                                    <p className="text-sm mt-2">Add notes after completing sessions</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PatientProgress;
