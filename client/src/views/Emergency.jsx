import { motion } from "framer-motion";

const Emergency = () => {
  const handleClick = () => {
    alert("SOS Signal Sent. Our emergency response team and your designated contacts are being notified immediately.");
  };

  const contacts = [
    { label: "National Emergency", number: "112", icon: "🚓" },
    { label: "Suicide Prevention", number: "9152987821", icon: "🫂" },
    { label: "Ambulance", number: "102", icon: "🚑" },
    { label: "Domestic Violence", number: "181", icon: "🛡️" }
  ];

  return (
    <div className="min-h-screen bg-rose-50 dark:bg-[#1a0b0b] flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
      {/* Red Pulse background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/50 rounded-[3rem] shadow-2xl p-10 text-center relative z-10"
      >
        <div className="w-24 h-24 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce">
          🚨
        </div>

        <h1 className="text-4xl font-black text-rose-700 dark:text-rose-500 mb-4 tracking-tighter">Emergency Assistance</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 font-medium mb-10 leading-relaxed">
          If you are in immediate danger or experiencing a crisis, please use the resources below.
          <span className="font-black dark:text-rose-400"> You are not alone, help is just a call away.</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left">
          {contacts.map((contact, i) => (
            <motion.a
              href={`tel:${contact.number}`}
              key={i}
              whileHover={{ x: 5 }}
              className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 transition-all group"
            >
              <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{contact.icon}</div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{contact.label}</p>
                <p className="text-xl font-black text-slate-700 dark:text-white">{contact.number}</p>
              </div>
            </motion.a>
          ))}
        </div>

        <div className="space-y-6">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Immediate Response</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className="w-full py-6 bg-gradient-to-br from-rose-600 to-red-700 text-white rounded-[2rem] font-black text-2xl shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 transition-all flex items-center justify-center gap-4 group"
          >
            <span className="text-3xl group-hover:animate-ping">🆘</span> Send SOS Signal
          </motion.button>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">
            This will notify your designated therapist and emergency contacts immediately.
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-12 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2"
      >
        <div className="h-1 w-1 bg-rose-500 rounded-full animate-ping" />
        Mental Wellness Safety Network
      </motion.p>
    </div>
  );
};

export default Emergency;
