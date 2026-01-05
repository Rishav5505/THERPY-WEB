import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SelfHelp = () => {
  const [breathing, setBreathing] = useState(false);
  const [breathText, setBreathText] = useState("Inhale");

  useEffect(() => {
    let interval;
    if (breathing) {
      let phase = 0;
      interval = setInterval(() => {
        phase = (phase + 1) % 3;
        if (phase === 0) setBreathText("Inhale");
        if (phase === 1) setBreathText("Hold");
        if (phase === 2) setBreathText("Exhale");
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [breathing]);

  const resources = [
    { title: "Mindfulness", id: "ZToicYcHIOU", category: "Meditation" },
    { title: "Deep Breathing", id: "1vx8iUvfyCY", category: "Relaxation" },
    { title: "Stress Relief", id: "inpok4MKVLM", category: "Mental Focus" },
    { title: "Anxiety Help", id: "EKkzbbLYPuI", category: "Therapy" },
    { title: "Sleep Guide", id: "w6T02g5hnT4", category: "Rest" },
    { title: "Calm Focus", id: "MIr3RsUWrdo", category: "Meditation" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Hero Section */}
        <div className="text-center mb-16 mt-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6"
          >
            Wellness <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Toolkit</span>
          </motion.h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto italic">
            "Your digital space for immediate calm and long-term resilience."
          </p>
        </div>

        {/* Breathing Exercise Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-16 bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl shadow-indigo-500/10 border border-indigo-100 dark:border-slate-800 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Interactive Breathing</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 max-w-lg mx-auto">
              Use this simple tool to ground yourself. Breathe in sync with the expanding circle.
            </p>

            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={breathing ? {
                  scale: [1, 1.5, 1.5, 1],
                } : { scale: 1 }}
                transition={breathing ? {
                  duration: 12,
                  repeat: Infinity,
                  times: [0, 0.33, 0.66, 1],
                  ease: "easeInOut"
                } : {}}
                className={`w-40 h-40 md:w-56 md:h-56 rounded-full flex items-center justify-center text-2xl font-black uppercase tracking-widest ${breathing ? 'bg-indigo-600 text-white shadow-[0_0_50px_rgba(99,102,241,0.4)]' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 opacity-50'}`}
              >
                {breathing ? breathText : "Ready?"}
              </motion.div>

              <button
                onClick={() => setBreathing(!breathing)}
                className={`mt-12 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${breathing ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-indigo-600 text-white shadow-indigo-500/20'} shadow-xl hover:scale-105 active:scale-95`}
              >
                {breathing ? "Stop Practice" : "Start Session"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Video Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl transition-all hover:border-indigo-200 dark:hover:border-indigo-500/30">
                <div className="aspect-video relative rounded-[2.5rem] overflow-hidden mb-6">
                  <iframe
                    className="w-full h-full border-none"
                    src={`https://www.youtube.com/embed/${res.id}`}
                    title={res.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="px-6 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{res.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {res.title}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 p-12 bg-slate-900 dark:bg-indigo-600 rounded-[3rem] text-center text-white"
        >
          <h4 className="text-2xl font-black mb-4">Personalized Care</h4>
          <p className="text-indigo-100 font-medium max-w-lg mx-auto mb-8">
            These tools are just the beginning. Our therapists can help you create a custom wellness plan that fits your unique life.
          </p>
          <button className="px-8 py-3 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition-all">
            Consult a Specialist
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SelfHelp;
