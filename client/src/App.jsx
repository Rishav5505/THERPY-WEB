import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./views/Navbar";
import Footer from "./views/Footer";
import Hero from "./views/Hero";
import About from "./views/About";
import Services from "./views/Services";
import Contact from "./views/Contact";
import Auth from "./views/Auth";
import MoodTracker from "./views/MoodTracker";
import BookTherapy from "./views/BookTherapy";
import SelfHelp from "./views/SelfHelp";
import Emergency from "./views/Emergency";
import Forum from "./views/Forum";
import TherapistDashboard from "./views/TherapistDashboard";
import TherapistHome from "./views/TherapistHome"; // Import the new component
import PatientDashboard from "./views/PatientDashboard";
import Appointments from "./views/Appointments";
import Patients from "./views/Patients";
import Notes from "./views/Notes";
import VideoCall from "./views/VideoCall";
import Chatbot from "./views/Chatbot";
import Payment from "./views/Payment";
import PatientHome from "./views/PatientHome";
import CalendarView from "./views/CalendarView"; // 📅 Calendar View
import Chat from "./views/Chat"; // 💬 Chat
import PatientProgress from "./views/PatientProgress"; // 📊 Patient Progress Dashboard
import Rewards from "./views/Rewards"; // 🎖️ Rewards & Leaderboard
import MeditationLibrary from "./views/MeditationLibrary"; // 🎵 Meditation Library
import PatientSummaries from "./views/PatientSummaries"; // 📄 Session Summaries
import Portrait from "./views/Profile"; // 🎨 Profile Customization
import PWAInstallPrompt from "./components/PWAInstallPrompt"; // 📱 PWA Install Prompt

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Protected Route Component
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="relative min-h-screen">
      {/* Visual background enhancements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-[#0b0f1a] transition-colors duration-500" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/5"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] dark:bg-purple-500/5"
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="flex-grow">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Hero />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/payment" element={<Payment />} />

            {/* ✅ PATIENT NESTED ROUTES - PROTECTED */}
            <Route path="/patient" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>}>
              <Route index element={<PatientHome />} />
              <Route path="mood" element={<MoodTracker />} />
              <Route path="book" element={<BookTherapy />} />
              <Route path="selfhelp" element={<SelfHelp />} />
              <Route path="emergency" element={<Emergency />} />
              <Route path="forum" element={<Forum />} />
              <Route path="chatbot" element={<Chatbot />} />
              <Route path="chat" element={<Chat />} /> {/* 💬 Chat */}
              <Route path="rewards" element={<Rewards />} /> {/* 🎖️ Rewards */}
              <Route path="meditation" element={<MeditationLibrary />} /> {/* 🎵 Zen Library */}
              <Route path="summaries" element={<PatientSummaries />} /> {/* 📄 Session Summaries */}
              <Route path="profile" element={<Portrait />} /> {/* 🎨 Profile */}
              <Route path="video-call/:bookingId" element={<VideoCall />} /> {/* ✅ Add Patient Video Route */}
            </Route>


            {/* ✅ THERAPIST NESTED ROUTES - PROTECTED */}
            <Route path="/therapist" element={<ProtectedRoute role="therapist"><TherapistDashboard /></ProtectedRoute>}>
              <Route index element={<TherapistHome />} /> {/* Add Index Route */}
              <Route path="appointments" element={<Appointments />} />
              <Route path="calendar" element={<CalendarView />} /> {/* 📅 Calendar View */}
              <Route path="chat" element={<Chat />} /> {/* 💬 Chat */}
              <Route path="manage-patients" element={<Patients />} />
              <Route path="patient-progress" element={<PatientProgress />} /> {/* 📊 Patient Progress Dashboard */}
              <Route path="session-notes" element={<Notes />} />
              <Route path="forum" element={<Forum />} />
              <Route path="profile" element={<Portrait />} /> {/* 🎨 Profile */}
              <Route path="video-call/:bookingId" element={<VideoCall />} /> {/* ✅ Update Therapist Route */}
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
        <PWAInstallPrompt />
      </div>
    </div>
  );
}

export default App;
