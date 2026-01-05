import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "1:1 Counseling",
      desc: "Connect with licensed therapists for private, insightful sessions tailored to your emotional needs.",
      icon: "🧘‍♂️",
      path: "/patient/book",
      color: "from-indigo-500 to-indigo-700"
    },
    {
      title: "Mood Tracking",
      desc: "Use AI to visualize your emotional journey and discover patterns you never knew existed.",
      icon: "📊",
      path: "/patient/mood",
      color: "from-purple-500 to-purple-700"
    },
    {
      title: "Resource Library",
      desc: "Curated collection of videos, articles, and exercises to help you build resilience and peace.",
      icon: "📘",
      path: "/patient/selfhelp",
      color: "from-rose-500 to-rose-700"
    },
    {
      title: "Supportive Forum",
      desc: "A safe, moderated space to share your story and find strength in a community of peers.",
      icon: "🤝",
      path: "/patient/forum",
      color: "from-emerald-500 to-emerald-700"
    },
    {
      title: "AI Companion",
      desc: "An intelligent chatbot available 24/7 to listen, support, and guide you through tough moments.",
      icon: "🤖",
      path: "/patient/chatbot",
      color: "from-cyan-500 to-cyan-700"
    },
    {
      title: "Crisis Support",
      desc: "Immediate access to emergency resources and professional contacts when you need them most.",
      icon: "🚨",
      path: "/patient/emergency",
      color: "from-red-500 to-red-700"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f1a] pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-6"
          >
            Nurturing <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Your Mind</span>
          </motion.h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Explore our comprehensive suite of mental wellness tools designed to support you at every stage of your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              onClick={() => navigate(service.path)}
              className="group cursor-pointer"
            >
              <div className="h-full bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-800 transition-all hover:shadow-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.color} rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {service.desc}
                </p>
                <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <span>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Commitment Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 p-12 bg-slate-900 dark:bg-indigo-600 rounded-[3rem] text-center text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32" />

          <h2 className="text-4xl font-black mb-6 relative z-10">Our Commitment to You</h2>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto font-medium relative z-10 mb-10">
            "Your privacy, safety, and comfort are our top priorities. Every tool we build is designed with deep empathy and scientific backing to ensure you get the best support possible."
          </p>
          <button
            onClick={() => navigate("/contact")}
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl relative z-10"
          >
            Speak to an Expert
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Services;
