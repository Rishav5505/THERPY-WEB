// views/Rewards.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../api/axios';

const Rewards = () => {
    const [userStats, setUserStats] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(sessionStorage.getItem('user'));

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch updated user stats (points, badges, streaks)
            const statsRes = await axios.get(`/auth/user/${user._id}`);
            setUserStats(statsRes.data);

            // Fetch leaderboard
            const leaderboardRes = await axios.get('/gamification/leaderboard');
            setLeaderboard(leaderboardRes.data);
        } catch (err) {
            console.error("Error fetching rewards data:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8 p-4">
            {/* Header / Point Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <h1 className="text-4xl font-black mb-2">My Rewards Hub 🎖️</h1>
                        <p className="text-white/80 font-medium">Earn points by prioritizing your mental health.</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 text-center border border-white/30 min-w-[200px]">
                        <p className="text-5xl font-black mb-1">{userStats?.points || 0}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">Total Points</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Badges Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        🎖️ My Achievements
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {userStats?.badges?.length > 0 ? (
                            userStats.badges.map((badge, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 text-center"
                                >
                                    <div className="text-5xl mb-4 bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                                        {badge.icon}
                                    </div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{badge.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Earned {new Date(badge.dateEarned).toLocaleDateString()}</p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-slate-400 font-medium">Complete your first session or log mood to earn badges!</p>
                            </div>
                        )}
                    </div>

                    {/* Streaks Card */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Current Streak</h3>
                            <p className="text-slate-500 font-medium">Keep it up! Log your mood daily.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">🔥</span>
                            <div className="text-right">
                                <p className="text-4xl font-black text-indigo-600 italic">{userStats?.currentStreak || 0} Days</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Streak</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        🏆 Leaderboard
                    </h2>
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Top Recovering Warriors</p>
                        </div>
                        <div className="divide-y divide-slate-50 dark:divide-slate-800">
                            {leaderboard.map((player, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-yellow-400 text-white' :
                                                idx === 1 ? 'bg-slate-300 text-white' :
                                                    idx === 2 ? 'bg-orange-400 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                            }`}>
                                            {idx + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                                            {player.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white text-sm">{player.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">Warrior</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-indigo-600">{player.points} pts</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                            <p className="text-[10px] font-bold text-slate-400 italic">Names are anonymized for privacy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Rewards;
