import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MeditationLibrary = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [activeAudio, setActiveAudio] = useState(null);

    const categories = [
        { id: 'all', label: 'All', icon: '🌈' },
        { id: 'anxiety', label: 'Anxiety', icon: '🍃' },
        { id: 'sleep', label: 'Sleep', icon: '🌙' },
        { id: 'focus', label: 'Focus', icon: '🎯' },
        { id: 'healing', label: 'Healing', icon: '✨' },
    ];

    const content = [
        {
            id: 1,
            title: "Ocean Breath Meditation",
            type: "guided",
            category: "anxiety",
            duration: "10 mins",
            author: "MindMend Guides",
            thumbnail: "https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?auto=format&fit=crop&w=800&q=80",
            audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo audio
            description: "A calming deep-breathing exercise inspired by oceanic rhythms."
        },
        {
            id: 2,
            title: "Deep Sleep Soundscape",
            type: "ambient",
            category: "sleep",
            duration: "30 mins",
            author: "Nature Sounds",
            thumbnail: "https://images.unsplash.com/photo-1520206159572-c6104c6d3950?auto=format&fit=crop&w=800&q=80",
            spotifyId: "37i9dQZF1DWZeKzbUnE3Yv", // Spotify embed
            description: "Soft rain and distant thunder to help you drift into deep REM sleep."
        },
        {
            id: 3,
            title: "Morning Focus Flow",
            type: "guided",
            category: "focus",
            duration: "15 mins",
            author: "Dr. Sarah",
            thumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
            youtubeId: "z6X5oEIg6Ak", // YouTube embed
            description: "Sharp and alert. Align your energy for a productive day ahead."
        },
        {
            id: 4,
            title: "Calm Your Mind",
            type: "spotify",
            category: "anxiety",
            duration: "Playlist",
            author: "Spotify Curated",
            thumbnail: "https://images.unsplash.com/photo-1474418397713-7ded61d46e18?auto=format&fit=crop&w=800&q=80",
            spotifyId: "37i9dQZF1DX4sWspS3o3uV",
            description: "Perfect blend of lofi and soft instrumental for anxiety relief."
        },
        {
            id: 5,
            title: "Healing Frequencies",
            type: "ambient",
            category: "healing",
            duration: "20 mins",
            author: "Zen Master",
            thumbnail: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80",
            youtubeId: "Gv6_PId6O7I",
            description: "528Hz Solfeggio frequency for cellular healing and peace."
        }
    ];

    const filteredContent = selectedCategory === 'all'
        ? content
        : content.filter(item => item.category === selectedCategory);

    return (
        <div className="min-h-screen space-y-8">
            {/* Header Section */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -mr-20 -mt-20" />
                <div className="relative z-10">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
                        Zen Library 🎵
                    </h1>
                    <p className="text-indigo-200 text-lg font-medium max-w-2xl leading-relaxed">
                        Find your inner peace with our curated collection of guided meditations,
                        healing soundscapes, and restful playlists.
                    </p>
                </div>
            </motion.header>

            {/* Filter Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all whitespace-nowrap shadow-lg ${selectedCategory === cat.id
                                ? "bg-indigo-600 text-white scale-105 shadow-indigo-500/30"
                                : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800"
                            }`}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="wait">
                    {filteredContent.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ y: -5 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 group"
                        >
                            <div className="relative h-48">
                                <img
                                    src={item.thumbnail}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={item.title}
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                    {item.type}
                                </div>
                                <div className="absolute top-4 right-4 text-white text-xs font-bold bg-black/40 backdrop-blur px-3 py-1 rounded-full">
                                    {item.duration}
                                </div>
                                <button
                                    onClick={() => setActiveAudio(item)}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <div className="w-16 h-16 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-3xl border border-white/50">
                                        ▶️
                                    </div>
                                </button>
                            </div>

                            <div className="p-6 space-y-3">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-sm font-bold text-slate-400">By {item.author}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                    {item.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Player Modal / Detail Overlay */}
            <AnimatePresence>
                {activeAudio && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative border border-slate-200 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setActiveAudio(null)}
                                className="absolute top-6 right-6 z-10 w-12 h-12 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center text-white text-xl font-bold backdrop-blur"
                            >
                                ✕
                            </button>

                            <div className="flex flex-col md:flex-row h-full">
                                <div className="md:w-2/5 relative h-64 md:h-auto">
                                    <img src={activeAudio.thumbnail} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                                        <h2 className="text-2xl font-black text-white mb-1">{activeAudio.title}</h2>
                                        <p className="text-indigo-300 font-bold uppercase tracking-widest text-xs">{activeAudio.author}</p>
                                    </div>
                                </div>

                                <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 font-medium">
                                        {activeAudio.description}
                                    </p>

                                    <div className="space-y-6">
                                        {activeAudio.spotifyId && (
                                            <iframe
                                                src={`https://open.spotify.com/embed/playlist/${activeAudio.spotifyId}?utm_source=generator`}
                                                width="100%"
                                                height="152"
                                                frameBorder="0"
                                                allowFullScreen=""
                                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                                loading="lazy"
                                                className="rounded-2xl shadow-xl"
                                            ></iframe>
                                        )}

                                        {activeAudio.youtubeId && (
                                            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                                                <iframe
                                                    width="100%"
                                                    height="100%"
                                                    src={`https://www.youtube.com/embed/${activeAudio.youtubeId}?autoplay=1`}
                                                    title="YouTube video player"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        )}

                                        {activeAudio.audioUrl && (
                                            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl shadow-inner text-center">
                                                <div className="animate-pulse flex justify-center gap-1 mb-6">
                                                    {[1, 2, 3, 4, 5].map(v => <div key={v} className="w-1 bg-indigo-500 h-8 rounded-full" />)}
                                                </div>
                                                <audio controls className="w-full">
                                                    <source src={activeAudio.audioUrl} type="audio/mpeg" />
                                                    Your browser does not support the audio element.
                                                </audio>
                                            </div>
                                        )}
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

export default MeditationLibrary;
