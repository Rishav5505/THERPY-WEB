import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const PatientSummaries = () => {
    const [summaries, setSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSummary, setSelectedSummary] = useState(null);

    useEffect(() => {
        const fetchSummaries = async () => {
            try {
                const res = await axios.get('/session-summaries/patient');
                setSummaries(res.data);
            } catch (err) {
                console.error("Error fetching summaries:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummaries();
    }, []);

    return (
        <div className="min-h-screen space-y-8">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <h1 className="text-4xl font-black text-white mb-2">Session Insights 📄</h1>
                <p className="text-blue-100/70 font-medium">Review your progress, key takeaways, and action items from previous sessions.</p>
            </motion.header>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Loading Summaries...</p>
                </div>
            ) : summaries.length === 0 ? (
                <div className="p-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 font-bold">No session summaries available yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {summaries.map((summary, idx) => (
                        <motion.div
                            key={summary._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedSummary(summary)}
                            className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-2xl group-hover:scale-110 transition-transform">📄</div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {new Date(summary.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1">{summary.therapist?.name || 'Therapist'} Session</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 font-medium italic">"{summary.summary}"</p>
                            <div className="flex gap-2">
                                {summary.keyTakeaways.slice(0, 2).map((t, i) => (
                                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-bold text-slate-500 rounded-md uppercase">Takeaway</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedSummary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => setSelectedSummary(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedSummary(null)}
                                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors font-bold z-10"
                            >
                                ✕
                            </button>

                            <div className="p-10 space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Session Summary</h2>
                                    <p className="text-sm font-bold text-indigo-600 uppercase tracking-[0.2em]">
                                        {new Date(selectedSummary.createdAt).toLocaleDateString()} with {selectedSummary.therapist?.name}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Therapist Notes</h4>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed leading-relaxed italic">"{selectedSummary.summary}"</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span>✨</span> Key Takeaways
                                            </h4>
                                            <ul className="space-y-2">
                                                {selectedSummary.keyTakeaways.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                        <span className="text-indigo-400 mt-1">•</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span>🌱</span> Action Items
                                            </h4>
                                            <ul className="space-y-2">
                                                {selectedSummary.actionItems.map((item, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm font-bold text-slate-600 dark:text-slate-400">
                                                        <span className="text-emerald-400 mt-1">✓</span> {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PatientSummaries;
