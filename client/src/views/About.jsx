import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f1a] pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] -mr-48 -mt-20" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
              We're on a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">mission to heal.</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed mb-8">
              MindMend started with a simple belief: mental wellness shouldn't be a luxury.
              In a world that's faster and more connected than ever, we've focused on creating a
              safe sanctuary for your mind.
            </p>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200" />
                ))}
              </div>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Join <span className="text-indigo-600 dark:text-indigo-400">10,000+</span> users who <br />
                found peace with MindMend.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-[3rem] overflow-hidden shadow-2xl rotate-3 h-[400px] w-full">
              <img
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Peaceful Yoga"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Core Values */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">Our Core Values</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">"The pillars that define every feature we build."</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Empathy First", icon: "❤️", desc: "Every interaction is handled with deep human understanding." },
              { title: "Privacy Always", icon: "🔒", desc: "Your data is yours. We use medical-grade encryption." },
              { title: "Science-Backed", icon: "🔬", desc: "Our tools are built on established psychological frameworks." },
              { title: "Inclusive Care", icon: "🌍", desc: "Safe space for everyone, regardless of background." }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-center"
              >
                <div className="text-4xl mb-6">{value.icon}</div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">{value.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Join Us CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative p-16 rounded-[3rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 text-center text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10">Start your journey today.</h2>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-10 relative z-10 font-medium leading-relaxed">
            Whether you're a patient seeking care or a therapist looking to help,
            MindMend provides the perfect platform to make it happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <button
              onClick={() => navigate("/auth")}
              className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl"
            >
              Sign Up Now
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="px-10 py-4 bg-transparent border-2 border-white/30 hover:border-white text-white rounded-2xl font-black transition-all"
            >
              Contact Support
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
