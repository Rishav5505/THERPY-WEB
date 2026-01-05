import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const socket = io(import.meta.env.VITE_SOCKET_URL || "https://therpy-web.onrender.com");

const Forum = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [activeTab, setActiveTab] = useState("Growth");
  const scrollRef = useRef(null);

  const tags = ["Growth", "Anxiety", "Healing", "Victory", "Support"];

  useEffect(() => {
    // Fetch existing messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/forum`);
        const storedUser = JSON.parse(sessionStorage.getItem("user"));
        const mappedMessages = response.data.reverse().map(msg => ({
          text: msg.message,
          id: msg._id,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          user: msg.username || "Anonymous",
          isOwn: storedUser && msg.username === storedUser.name
        }));
        setChat(mappedMessages);
      } catch (err) {
        console.error("Error fetching forum messages:", err);
      }
    };

    fetchMessages();

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, {
        text: data.text,
        id: data.id || Date.now(),
        time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: data.user || "Anonymous",
        isOwn: false
      }]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = (e) => {
    e.preventDefault();
    const storedUser = JSON.parse(sessionStorage.getItem("user"));
    const currentUserName = storedUser?.name || "Anonymous";

    if (message.trim()) {
      socket.emit("sendMessage", { message, username: currentUserName });
      setChat((prev) => [...prev, {
        text: message,
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: currentUserName,
        isOwn: true
      }]);
      setMessage("");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Anonymous Community</h1>
          <p className="text-slate-500 font-medium italic mt-1">Connect, share, and heal together in total privacy.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl overflow-x-auto max-w-full">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTab(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tag ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-500" />

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth custom-scrollbar"
          >
            {chat.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30">
                <div className="text-6xl mb-4">💬</div>
                <p className="font-black uppercase tracking-widest text-xs">Waiting for soul connections...</p>
              </div>
            ) : (
              <AnimatePresence>
                {chat.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.isOwn ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex flex-col ${msg.isOwn ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {!msg.isOwn && <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">👤</div>}
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.user} • {msg.time}</span>
                    </div>
                    <div
                      className={`px-6 py-4 rounded-[1.8rem] text-sm font-bold leading-relaxed shadow-sm ${msg.isOwn
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={sendMessage} className="flex gap-4">
              <input
                type="text"
                className="flex-1 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl outline-none font-bold text-slate-700 dark:text-white border-2 border-transparent focus:border-indigo-400 transition-all shadow-inner"
                placeholder="Share your thoughts anonymously..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all text-xl">
                🚀
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <h4 className="text-xl font-black mb-4 relative z-10">Community Pulse</h4>
            <p className="text-sm text-indigo-100/70 font-medium relative z-10 mb-6">You are currently in a secure, anonymous encryption layer. No one can see your identity.</p>
            <div className="flex -space-x-3 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-slate-900 bg-slate-700 flex items-center justify-center text-xs">👤</div>
              ))}
              <div className="w-10 h-10 rounded-full border-4 border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-black">+42</div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Online Now</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl flex-1">
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 underline decoration-indigo-500 decoration-4 underline-offset-8">Community Guidelines</h4>
            <ul className="space-y-4">
              {[
                { icon: "✨", text: "Be kind and supportive" },
                { icon: "🔒", text: "Keep it anonymous" },
                { icon: "🚫", text: "No spam or selling" },
                { icon: "🤝", text: "Report toxic behavior" }
              ].map((rule, i) => (
                <li key={i} className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                  <span>{rule.icon}</span>
                  <span>{rule.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 text-center">
              <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Safe Space Verified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forum;
