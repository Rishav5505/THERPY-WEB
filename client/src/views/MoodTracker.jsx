import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LineChart from "./LineChart";
import axios from "../api/axios";

const moods = [
  { mood: "Happy", emoji: "😊", color: "from-amber-400 to-orange-500", label: "Pure Joy" },
  { mood: "Relaxed", emoji: "😌", color: "from-emerald-400 to-teal-600", label: "Calm Mind" },
  { mood: "Stressed", emoji: "😣", color: "from-rose-400 to-red-600", label: "Higher Stress" },
  { mood: "Sad", emoji: "😢", color: "from-blue-400 to-indigo-600", label: "Bit Blue" },
  { mood: "Angry", emoji: "😠", color: "from-red-600 to-rose-900", label: "Intense Heat" },
];

const aiSuggestions = {
  Happy: "Share your radiance! Write down three things you achieved today to amplify this feeling.",
  Sad: "It's okay to be gentle with yourself. Grab a warm tea and listen to some soft ambient sounds.",
  Stressed: "Time for a 4-7-8 breathing reset. Inhale for 4s, hold for 7s, exhale for 8s. Repeat 3 times.",
  Angry: "Channel this energy. Try a high-intensity 5-minute movement or express your thoughts on paper.",
  Relaxed: "Deepen this serenity. A focused 5-minute meditation will anchor this peace for the rest of your day.",
};

export default function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/auth", { replace: true });
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/mood");
      setMoodHistory(res.data);
    } catch (err) {
      console.error("History error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setLoading(true);
    try {
      const res = await axios.post("/mood", { mood: selectedMood, note });
      setMoodHistory((prev) => [res.data, ...prev]);
      setSelectedMood(null);
      setNote("");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || "Failed to sync."));
    } finally {
      setLoading(false);
    }
  };

  const chartData = (() => {
    if (!moodHistory.length) return null;
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString(undefined, { weekday: 'short' });
    });
    const moodMap = { Happy: 5, Relaxed: 4, Stressed: 3, Sad: 2, Angry: 1 };
    const dayMoods = days.map((day) => {
      const entry = moodHistory.find((e) => new Date(e.createdAt).toLocaleDateString(undefined, { weekday: 'short' }) === day);
      return entry ? moodMap[entry.mood] || 0 : 0;
    });
    return {
      labels: days,
      datasets: [{
        label: "Wellness Level",
        data: dayMoods,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.5,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: "#fff",
        pointBorderWidth: 4,
        pointBorderColor: "#6366f1"
      }],
    };
  })();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 6, display: false },
      x: { grid: { display: false }, ticks: { font: { weight: 'bold' }, color: '#94a3b8' } }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] pt-10 pb-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Input Column */}
        <div className="lg:col-span-3 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800"
          >
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Mood Sanctuary</h1>
            <p className="text-slate-500 font-medium mb-10 italic">"Your feelings are valid. Let's capture the essence of your day."</p>

            <div className="grid grid-cols-5 gap-4 mb-10">
              {moods.map((item) => (
                <button
                  key={item.mood}
                  onClick={() => setSelectedMood(item.mood)}
                  className={`flex flex-col items-center gap-2 group transition-all ${selectedMood === item.mood ? 'scale-110' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <div className={`w-14 h-14 md:w-20 md:h-20 flex items-center justify-center text-3xl md:text-5xl rounded-3xl bg-gradient-to-br ${item.color} shadow-lg transition-transform group-active:scale-90`}>
                    {item.emoji}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence>
              {selectedMood && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-500/10 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-500/20">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-2">Inner Guidance</h4>
                    <p className="text-slate-700 dark:text-slate-200 font-bold leading-relaxed">{aiSuggestions[selectedMood]}</p>
                  </div>

                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-slate-700 dark:text-white transition-all placeholder:text-slate-400"
                    rows="4"
                    placeholder="Pour your thoughts here... what triggered this feeling?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
                  >
                    {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "Save to My Journey"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Trend Chart */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Wellness Trend</h3>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Updates</span>
            </div>
            <div className="h-64">
              {chartData && <LineChart data={chartData} options={chartOptions} />}
            </div>
          </div>
        </div>

        {/* Journey Timeline Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="sticky top-32">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-6 ml-4">Journey Timeline</h2>
            <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
              {moodHistory.map((entry, idx) => (
                <motion.div
                  key={entry._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${moods.find(m => m.mood === entry.mood)?.color || 'from-slate-200 to-slate-400'}`} />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-3xl">{moods.find(m => m.mood === entry.mood)?.emoji}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{entry.mood}</h4>
                  {entry.note && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">"{entry.note}"</p>}
                </motion.div>
              ))}
              {moodHistory.length === 0 && (
                <div className="p-20 text-center bg-slate-100 dark:bg-slate-800/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-400 font-bold italic">Your history is a blank canvas. Start today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
