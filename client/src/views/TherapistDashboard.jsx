import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TherapistDashboard = () => {
  const [therapistName, setTherapistName] = useState("");
  const location = useLocation();

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.name) {
        setTherapistName(user.name);
      }
    }
  }, []);

  const menuItems = [
    { name: "Home", path: "/therapist", icon: "🏠" },
    { name: "Appts", path: "/therapist/appointments", icon: "📅" },
    { name: "Calendar", path: "/therapist/calendar", icon: "📆" },
    { name: "Chat", path: "/therapist/chat", icon: "💬" },
    { name: "Patients", path: "/therapist/manage-patients", icon: "🧑‍🤝‍🧑" },
    { name: "Stats", path: "/therapist/patient-progress", icon: "📊" },
    { name: "Notes", path: "/therapist/session-notes", icon: "📝" },
    { name: "Forum", path: "/therapist/forum", icon: "💬" },
    { name: "Profile", path: "/therapist/profile", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080b14] relative">
      {/* Sidebar - Desktop Only */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        className="hidden lg:block fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-100 dark:border-slate-800"
      >
        <div className="p-6 h-full overflow-y-auto">
          <div className="mb-10 mt-10">
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Therapist Hub</h2>
            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Medical Control</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${location.pathname === item.path
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg"
                    : "text-gray-500 hover:bg-purple-50 dark:hover:bg-slate-800 hover:text-purple-600 dark:hover:text-indigo-400"
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-sm">{item.name}</span>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full lg:ml-72 p-4 md:p-10 mb-20 lg:mb-0 pt-28 min-h-screen">
        <div className="mb-10 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-purple-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
          <h1 className="text-3xl lg:text-4xl font-black text-purple-900 dark:text-white mb-2 relative z-10">Welcome, {therapistName || "Doctor"} ✨</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium text-sm lg:text-lg relative z-10">Let's check your schedule for today.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="lg:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 z-[100] flex items-center justify-around px-2">
        {menuItems.slice(0, 5).map((item) => (
          <Link key={item.path} to={item.path} className="relative flex flex-col items-center justify-center w-full h-full">
            <motion.div
              whileTap={{ scale: 0.8 }}
              className={`p-2 rounded-xl flex flex-col items-center gap-0.5 ${location.pathname === item.path ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name}</span>
              {location.pathname === item.path && (
                <motion.div layoutId="nav-glow-doc" className="absolute inset-0 bg-purple-500/10 dark:bg-purple-400/10 blur-xl rounded-full -z-10" />
              )}
            </motion.div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default TherapistDashboard;
