import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif) => {
        await markAsRead(notif._id);
        if (notif.link) {
            navigate(notif.link);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition-all"
            >
                <span className="text-2xl">🔔</span>
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg border-2 border-white dark:border-slate-900"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-[24rem] origin-top-right rounded-[1.5rem] bg-white dark:bg-slate-900 p-2 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-50 dark:border-slate-800">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Notifications</h3>
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                Mark all as read
                            </button>
                        </div>

                        <div className="max-h-[30rem] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <span className="text-4xl block mb-2">🎈</span>
                                    <p className="text-sm font-bold text-slate-400">All caught up!</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 rounded-2xl mb-1 cursor-pointer transition-all ${notif.read
                                                ? 'bg-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                : 'bg-indigo-50/50 dark:bg-indigo-900/10 text-slate-900 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {notif.type === 'booking_request' && '📅'}
                                                {notif.type === 'booking_confirmed' && '✅'}
                                                {notif.type === 'session_reminder' && '⏳'}
                                                {notif.type === 'new_message' && '💬'}
                                                {notif.type === 'system' && '⚙️'}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm font-black ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {notif.title}
                                                    </p>
                                                    {!notif.read && <div className="h-2 w-2 rounded-full bg-indigo-600 shadow-sm" />}
                                                </div>
                                                <p className="text-[13px] font-medium leading-tight mt-1 opacity-80">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">
                                                    {new Date(notif.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-2 border-t border-slate-50 dark:border-slate-800">
                            <button className="w-full py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-black text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all uppercase tracking-widest">
                                View All Activity
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
