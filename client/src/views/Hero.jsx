import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const Hero = () => {
    const navigate = useNavigate();
    const [currentImage, setCurrentImage] = useState(0);

    const heroImages = [
        { url: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1200&auto=format&fit=crop", label: "Body Balance", emoji: "🧘‍♀️" },
        { url: "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?q=80&w=1200&auto=format&fit=crop", label: "Pure Joy", emoji: "✨" },
        { url: "https://images.unsplash.com/photo-1483721310020-03333e577078?q=80&w=1200&auto=format&fit=crop", label: "Active Life", emoji: "🏃‍♂️" },
        { url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop", label: "Inner Peace", emoji: "🕊️" },
        { url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop", label: "Community", emoji: "🤝" }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#FDFCF8] dark:bg-[#0b0f1a] overflow-hidden transition-colors duration-500">
            {/* 🌸 WARM ORGANIC BACKGROUND */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[10%] -right-[10%] w-[800px] h-[800px] bg-gradient-to-br from-orange-200 to-rose-200 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full blur-[100px] opacity-60"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[20%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-200 to-green-100 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full blur-[120px] opacity-60"
                />
            </div>

            <div className="relative z-10 w-full">
                <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[600px]">
                        {/* 📝 LEFT CONTENT */}
                        <div className="lg:col-span-5 flex flex-col items-start text-left">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-lg text-slate-800 dark:text-white font-bold text-xs uppercase tracking-widest mb-8"
                            >
                                <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                </span>
                                Start Feeling Better Today
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[0.95] mb-8 tracking-tight"
                            >
                                Heal your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 dark:from-indigo-400 dark:to-purple-400">
                                    inner world.
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-10 max-w-md"
                            >
                                You don't have to carry it all alone. Join <span className="font-bold text-slate-900 dark:text-white">MindMend</span> to connect with caring experts and find tools that actually help.
                            </motion.p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => navigate("/auth")}
                                    className="px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    Let's Talk 💬
                                </button>
                                <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10 shadow-lg">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200">
                                                <img src={`https://i.pravatar.cc/100?img=${i + 25}`} className="w-full h-full rounded-full object-cover" alt="user" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Join 12k+ others</p>
                                </div>
                            </div>
                        </div>

                        {/* 🖼️ RIGHT IMAGE SLIDER */}
                        <div className="lg:col-span-7 relative h-[600px] lg:h-[700px]">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className="relative z-10 w-full h-full"
                            >
                                <div className="relative w-full h-full rounded-[4rem] overflow-hidden shadow-2xl border-[6px] border-white dark:border-white/10">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentImage}
                                            src={heroImages[currentImage].url}
                                            alt="Wellness"
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 1 }}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                                    <div className="absolute top-8 right-8 glass px-6 py-3 rounded-full flex items-center gap-2 border border-white/20">
                                        <span className="text-xl">{heroImages[currentImage].emoji}</span>
                                        <span className="text-sm font-black text-white uppercase tracking-widest">{heroImages[currentImage].label}</span>
                                    </div>
                                </div>

                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-20 -left-10 bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-700 hidden md:block z-20"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center text-2xl">🌿</div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">Feeling Calm</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                                    {heroImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setCurrentImage(idx)}
                                            className={`h-2 rounded-full transition-all duration-300 ${idx === currentImage ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            </motion.div>

                            {/* Background Blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10">
                                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-orange-200/50 dark:text-indigo-600/20 fill-current animate-[spin_60s_linear_infinite]">
                                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.2,-19.2,95.8,-5.3C93.5,8.6,81.9,21.5,70.6,32.3C59.3,43,48.2,51.6,36.5,58.5C24.8,65.4,12.4,70.6,-0.7,71.8C-13.8,73,-27.6,70.2,-39.7,63.6C-51.8,57,-62.2,46.6,-70.3,34.4C-78.4,22.2,-84.2,8.2,-83.4,-5.4C-82.6,-19,-75.2,-32.2,-64.8,-42.6C-54.3,-53,-40.8,-60.6,-27.2,-68.2C-13.6,-75.8,0.1,-83.4,14,-85.8C27.9,-88.2,40.5,-85.4,44.7,-76.4Z" transform="translate(100 100)" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🚀 LOGO STRIP */}
                <div className="border-y border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-16">
                    <div className="max-w-7xl mx-auto px-6 overflow-hidden">
                        <p className="text-center text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-10">Trusted by medical leaders from</p>
                        <div className="flex flex-wrap justify-center md:justify-between items-center opacity-40 grayscale dark:invert gap-8 md:gap-0 px-10">
                            {['CLINIC', 'HEALTH+', 'WELLNESS', 'MEDLIFE', 'SERENE'].map(logo => (
                                <span key={logo} className="text-3xl md:text-4xl font-black italic tracking-tighter">{logo}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🚀 NEW SECTION 1: HOW IT WORKS */}
                <div className="py-32 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">How Your Journey Begins</h2>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Three simple steps to reclaim your peace of mind.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { step: "01", title: "Sign Up", desc: "Create your anonymous profile in seconds.", icon: "📝" },
                                { step: "02", title: "Connect", desc: "Match with a therapist or join a support group.", icon: "🤝" },
                                { step: "03", title: "Heal", desc: "Start sessions and track your daily progress.", icon: "🌱" }
                            ].map((item, i) => (
                                <div key={i} className="relative p-10 bg-slate-50 dark:bg-slate-800 rounded-[3rem] text-center border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all group">
                                    <div className="text-6xl mb-6 bg-white dark:bg-slate-700 w-24 h-24 mx-auto rounded-full flex items-center justify-center shadow-lg">{item.icon}</div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{item.title}</h3>
                                    <p className="text-slate-500 font-medium">{item.desc}</p>
                                    <div className="absolute top-6 right-8 text-6xl font-black text-slate-200 dark:text-slate-700 opacity-20">{item.step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 🚀 NEW SECTION 2: WHY CHOOSE US (Features) */}
                <div className="py-32 bg-slate-50 dark:bg-[#080b14]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div>
                                <span className="text-indigo-600 font-black tracking-widest uppercase mb-4 block">Our Approach</span>
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">Science meets <br /> Compassion.</h2>
                                <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                                    We don't just give you tools; we give you a system. MindMend combines cognitive behavioral therapy (CBT) principles with advanced mood tracking to give you a complete picture of your health.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        "Licensed Therapists available 24/7",
                                        "AI-Driven Mood Analysis & Reports",
                                        "Safe, Anonymous Community Forums"
                                    ].map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-xl font-bold text-slate-800 dark:text-slate-300">
                                            <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">✓</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/services')} className="mt-12 px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all">
                                    View All Features
                                </button>
                            </div>
                            <div className="relative">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-6 mt-12">
                                        <img src="https://images.unsplash.com/photo-1527137342181-19aab11a8ee8?q=80&w=600&auto=format&fit=crop" className="rounded-[2.5rem] w-full h-64 object-cover shadow-xl" alt="feature1" />
                                        <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl">
                                            <h4 className="text-4xl font-black text-indigo-600 mb-2">24h</h4>
                                            <p className="font-bold text-slate-500">Support Access</p>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white">
                                            <h4 className="text-4xl font-black mb-2">10k+</h4>
                                            <p className="font-bold text-indigo-200">Lives Changed</p>
                                        </div>
                                        <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&auto=format&fit=crop" className="rounded-[2.5rem] w-full h-64 object-cover shadow-xl" alt="feature2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🚀 NEW SECTION 3: MENTAL HEALTH LIBRARY PREVIEW */}
                <div className="py-32 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-16">Explore our Wellness Library</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { title: "Anxiety", img: "https://images.pexels.com/photos/568027/pexels-photo-568027.jpeg?auto=compress&cs=tinysrgb&w=800" },
                                { title: "Depression", img: "https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg?auto=compress&cs=tinysrgb&w=800" },
                                { title: "Sleep", img: "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=800" },
                                { title: "Stress", img: "https://images.pexels.com/photos/313690/pexels-photo-313690.jpeg?auto=compress&cs=tinysrgb&w=800" }
                            ].map((topic, i) => (
                                <div key={i} className="group cursor-pointer relative overflow-hidden rounded-[2rem] h-64 shadow-lg">
                                    <img src={topic.img} alt={topic.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                        <h3 className="text-2xl font-black text-white">{topic.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => navigate('/services')} className="mt-12 text-indigo-600 font-black uppercase tracking-widest hover:underline">View All Resources →</button>
                    </div>
                </div>

                {/* 🚀 CTA SECTION */}
                <div className="py-20 px-6">
                    <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-indigo-900 rounded-[4rem] p-16 md:p-24 text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready to feel better?</h2>
                            <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">Join thousands of others who are taking back control of their mental health today.</p>
                            <button onClick={() => navigate("/auth")} className="px-12 py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:scale-105 transition-transform shadow-2xl">
                                Get Started for Free
                            </button>
                        </div>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-50" />
                        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500 rounded-full blur-[100px] opacity-40" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;
