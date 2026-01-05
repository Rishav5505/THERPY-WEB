import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I'm your MindMend companion. How can I support your mental wellness today? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://mind-mend-final-backend.onrender.com/api";
      const res = await fetch(`${baseUrl}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botReply = { sender: "bot", text: data.reply };
      setMessages((prev) => [...prev, botReply]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "I'm having a little trouble connecting right now. Please try again in a moment. 🕊️" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] pt-32 pb-20 px-6 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden"
        style={{ height: '700px' }}
      >
        {/* Header */}
        <div className="px-8 py-6 bg-slate-900 dark:bg-indigo-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm shadow-inner">
              🤖
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-tight">MindMend AI</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-100 opacity-70">Always Here for You</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
          </div>
        </div>

        {/* Chat Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-slate-50/50 dark:bg-slate-900/50"
        >
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] p-5 rounded-[2rem] text-sm font-bold leading-relaxed shadow-sm transition-all ${msg.sender === "bot"
                      ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-indigo-500/5"
                      : "bg-indigo-600 text-white rounded-tr-none shadow-indigo-500/20"
                    }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl rounded-tl-none border border-slate-100 dark:border-slate-700 flex gap-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-[2rem] border-2 border-transparent focus-within:border-indigo-400/50 transition-all">
            <input
              className="flex-1 bg-transparent px-6 py-3 text-sm font-bold outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Share what's on your mind..."
            />
            <button
              className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all active:scale-90"
              onClick={handleSend}
            >
              🚀
            </button>
          </div>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-[0.2em]">
            Our AI is here to provide support, not medical advice.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Chatbot;
