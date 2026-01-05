import { Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const PatientDashboard = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const location = useLocation();

  const menuItems = [
    { name: "Home", path: "/patient", icon: "🏠" },
    { name: "Mood", path: "/patient/mood", icon: "🧠" },
    { name: "Book", path: "/patient/book", icon: "📅" },
    { name: "Chat", path: "/patient/chat", icon: "💬" },
    { name: "Self Help", path: "/patient/selfhelp", icon: "📘" },
    { name: "Forum", path: "/patient/forum", icon: "🗣️" },
    { name: "Zen", path: "/patient/meditation", icon: "🎵" }, // Added Zen meditation
    { name: "Summaries", path: "/patient/summaries", icon: "📄" }, // Added Session Summaries
    { name: "AI", path: "/patient/chatbot", icon: "🤖" },
    { name: "Rewards", path: "/patient/rewards", icon: "🎖️" },
    { name: "Profile", path: "/patient/profile", icon: "👤" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#080b14]">
      {/* Sidebar - Always visible as it is in desktop */}
      <motion.aside
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-72 bg-white dark:bg-slate-900 shadow-2xl z-40 fixed h-full p-6 border-r border-slate-100 dark:border-slate-800"
      >
        <div className="mb-10 mt-10">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Patient Hub</h2>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Main Menu</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${location.pathname === item.path
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-500 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-indigo-400"
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm">{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content Area - Always has sidebar margin */}
      <main className="flex-1 ml-72 p-10 mt-20">
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

      {/* Mobile Bottom Navigation Removed to match desktop exactly */}
    </div>
  );
};

export default PatientDashboard;
