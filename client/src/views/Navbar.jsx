import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import NotificationBell from "../components/NotificationBell";

const Navbar = ({ theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("therapistId");
    navigate("/");
    window.location.reload();
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 ${isScrolled ? "py-3" : "py-5"}`}
    >
      <div className={`max-w-7xl mx-auto glass rounded-3xl px-4 md:px-6 py-2 flex justify-between items-center shadow-2xl shadow-indigo-500/10 transition-all ${isScrolled ? "rounded-2xl" : "rounded-[2rem]"}`}>
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center text-white text-lg md:text-xl font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            M
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 hidden sm:block">
            MindMend
          </span>
        </Link>

        <div className="flex items-center gap-3 md:gap-8">
          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative text-sm font-bold tracking-wide transition-colors ${location.pathname === link.to
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2" />

          <div className="flex items-center gap-2 md:gap-4">
            {user && <NotificationBell />}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg md:text-xl shadow-inner active:scale-95"
            >
              <motion.span
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </motion.span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 md:gap-3 p-1 md:pr-4 bg-slate-100 dark:bg-slate-800 rounded-xl md:rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-transparent"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] md:text-xs font-black shadow-md overflow-hidden">
                    {user.photoUrl ? (
                      <img src={`${socketUrl}${user.photoUrl}`} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.name?.charAt(0) || "U"
                    )}
                  </div>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest hidden md:block">{user.name?.split(' ')[0]}</span>
                  <span className={`text-[10px] transition-transform hidden md:block ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {/* ... User Menu AnimatePresence remains same ... */}

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-4 w-56 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-[60] overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Account Role</p>
                        <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-2 uppercase tracking-widest">
                          {user.role === 'therapist' ? '🩺 Doctor' : '👤 Patient'}
                        </p>
                      </div>

                      <Link
                        to={user.role === "therapist" ? "/therapist/profile" : "/patient/profile"}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        👤 My Profile
                      </Link>

                      <Link
                        to={user.role === "therapist" ? "/therapist" : "/patient"}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        🏠 Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-sm font-bold text-rose-500 transition-colors mt-2"
                      >
                        🚪 Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/auth"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                Join Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
