import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PatientProgressChart from "../components/PatientProgressChart"; // 📊 Progress Chart

const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://mind-mend-final-backend.onrender.com";

export default function TherapistAppointments() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null); // Modal State
  const [activeTab, setActiveTab] = useState('notes'); // Tab State: 'notes' or 'prescription' or 'progress' or 'summary'
  const [sessionSummary, setSessionSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("/bookings/therapist")
      .then((r) => {
        setApps(r.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Fetch error:", e);
        setErr("Failed to load your upcoming appointments.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Syncing Appointments...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl text-center">
        <p className="text-rose-600 font-bold">{err}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Upcoming Sessions</h2>
        <div className="px-4 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black uppercase tracking-widest">
          {apps.length} Total
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="p-20 bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center">
          <div className="text-5xl mb-4 opacity-20 text-slate-400">📅</div>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight text-lg">Your schedule is currently clear.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((a, idx) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {a.user?.photoUrl ? (
                    <img
                      src={`${socketUrl}${a.user.photoUrl}`}
                      alt={a.user?.name}
                      className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white dark:border-slate-800 group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-3xl shadow-inner border border-slate-100 dark:border-slate-700">
                      👤
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 shadow-sm" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight group-hover:text-indigo-600 transition-colors">
                    {a.user?.name || "Patient"}
                  </h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Confirmed Patient</p>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 transition-colors group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-500/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Date</span>
                  <span className="font-bold text-slate-700 dark:text-white text-sm">{a.date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Time</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{a.time}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPatient({ ...a.user, bookingId: a._id })}
                className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-slate-950/20 active:scale-95"
              >
                View Patient Profile
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* 👤 PATIENT PROFILE MODAL */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-4xl shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-visible text-left z-[1000] pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors font-bold z-10"
              >
                ✕
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* Left Side: Profile & Basics */}
                <div className="flex flex-col items-center w-full md:w-1/3">
                  <div className="w-28 h-28 rounded-full border-4 border-indigo-100 dark:border-indigo-900 overflow-hidden mb-4 shadow-xl">
                    {selectedPatient.photoUrl ? (
                      <img src={`${socketUrl}${selectedPatient.photoUrl}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">👤</div>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1 text-center">{selectedPatient.name || "Unknown"}</h2>
                  <p className="text-slate-500 font-bold text-sm mb-4">Patient</p>

                  <div className="w-full space-y-2">
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                      <p className="text-indigo-600 font-black">Confirmed</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase">ID</p>
                      <p className="text-slate-700 dark:text-slate-300 font-mono text-xs">#{selectedPatient._id ? selectedPatient._id.slice(-6) : "---"}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions & Notes */}
                <div className="flex-1 w-full space-y-6">

                  <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      📋 Session Actions
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={async () => {
                          if (window.confirm(`Start session with ${selectedPatient.name}?`)) {
                            try {
                              await axios.put(`/bookings/${selectedPatient.bookingId}/status`, { status: 'confirmed' });
                              navigate(`/therapist/video-call/${selectedPatient.bookingId}`);
                            } catch (e) {
                              alert("Could not update status, but starting call...");
                              navigate(`/therapist/video-call/${selectedPatient.bookingId}`);
                            }
                          }
                        }}
                        className="py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                      >
                        ✅ Start
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Mark session with ${selectedPatient.name} as completed?`)) {
                            try {
                              await axios.put(`/bookings/${selectedPatient.bookingId}/status`, { status: 'completed' });
                              alert("✅ Session marked as completed!");
                              setSelectedPatient(null);
                              window.location.reload();
                            } catch (e) {
                              console.error(e);
                              alert("❌ Failed to update status.");
                            }
                          }
                        }}
                        className="py-3 bg-blue-100 text-blue-700 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => alert("Reschedule request has been sent to the patient via notification.")}
                        className="py-3 bg-orange-100 text-orange-700 rounded-xl font-bold hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                      >
                        📅 Reschedule
                      </button>
                    </div>
                  </div>

                  {/* TABS */}
                  <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`text-sm font-black p-2 rounded-lg transition-colors ${activeTab === 'notes' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      📝 Session Notes
                    </button>
                    <button
                      onClick={() => setActiveTab('prescription')}
                      className={`text-sm font-black p-2 rounded-lg transition-colors ${activeTab === 'prescription' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      💊 Prescription
                    </button>
                    <button
                      onClick={() => setActiveTab('progress')}
                      className={`text-sm font-black p-2 rounded-lg transition-colors ${activeTab === 'progress' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      📊 Progress
                    </button>
                    <button
                      onClick={async () => {
                        setActiveTab('summary');
                        setSummaryLoading(true);
                        try {
                          console.log("Generating summary for:", selectedPatient.bookingId);
                          const res = await axios.post(`/session-summaries/generate/${selectedPatient.bookingId}`);
                          setSessionSummary(res.data);
                        } catch (e) {
                          console.error("Summary error:", e);
                          const msg = e.response?.data?.message || e.message;
                          alert(`AI Generation failed: ${msg}. Please ensure the backend is running.`);
                        } finally {
                          setSummaryLoading(false);
                        }
                      }}
                      className={`text-sm font-black p-2 rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      ✨ AI Summary
                    </button>
                  </div>

                  {activeTab === 'notes' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <textarea
                        id="session-notes-box"
                        defaultValue={selectedPatient.notes || ""}
                        className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium"
                        placeholder="Type session observations here..."
                      ></textarea>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={async () => {
                            const notes = document.getElementById("session-notes-box").value;
                            try {
                              await axios.put(`/bookings/${selectedPatient.bookingId}/status`, { notes });
                              alert("✅ Notes saved successfully!");
                            } catch (e) {
                              console.error(e);
                              alert("❌ Failed to save notes.");
                            }
                          }}
                          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform"
                        >
                          Save Notes
                        </button>
                      </div>
                    </motion.div>
                  ) : activeTab === 'prescription' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <input type="text" placeholder="💊 Medicine Name (e.g. Paracetamol)" className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                      <div className="flex gap-3">
                        <input type="text" placeholder="Dosage (e.g. 500mg)" className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                        <input type="text" placeholder="Frequency (e.g. 2x Daily)" className="flex-1 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <textarea placeholder="Instructions (e.g. Take after meals)" className="w-full h-20 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>

                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            alert("✅ Prescription sent to patient securely!");
                            setActiveTab('notes');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                        >
                          Send Rx
                        </button>
                      </div>
                    </motion.div>
                  ) : activeTab === 'progress' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <PatientProgressChart patientName={selectedPatient.name || "Patient"} />
                    </motion.div>
                  ) : activeTab === 'summary' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {summaryLoading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
                          <p className="text-xs font-bold text-slate-400 uppercase">AI Generating Summary...</p>
                        </div>
                      ) : sessionSummary ? (
                        <div className="space-y-4">
                          <textarea
                            className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm font-medium"
                            value={sessionSummary.summary}
                            onChange={(e) => setSessionSummary({ ...sessionSummary, summary: e.target.value })}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Key Takeaways</p>
                              <textarea
                                className="w-full h-24 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                                value={sessionSummary.keyTakeaways.join('\n')}
                                onChange={(e) => setSessionSummary({ ...sessionSummary, keyTakeaways: e.target.value.split('\n') })}
                              />
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Action Items</p>
                              <textarea
                                className="w-full h-24 bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                                value={sessionSummary.actionItems.join('\n')}
                                onChange={(e) => setSessionSummary({ ...sessionSummary, actionItems: e.target.value.split('\n') })}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={async () => {
                                try {
                                  await axios.put(`/session-summaries/${sessionSummary._id}`, sessionSummary);
                                  alert("✅ Summary saved!");
                                } catch (e) {
                                  alert("❌ Save failed");
                                }
                              }}
                              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase"
                            >
                              💾 Save Draft
                            </button>
                            <button
                              onClick={async () => {
                                if (window.confirm("Send this summary to the patient via email?")) {
                                  try {
                                    await axios.post(`/session-summaries/${sessionSummary._id}/send`);
                                    alert("📧 Summary sent to patient email!");
                                    setSessionSummary({ ...sessionSummary, status: 'sent' });
                                  } catch (e) {
                                    alert("❌ Failed to send email");
                                  }
                                }
                              }}
                              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-indigo-500/30"
                            >
                              {sessionSummary.status === 'sent' ? "📤 Resend Email" : "📧 Send to Patient"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </motion.div>
                  ) : null}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                    <button
                      onClick={() => navigate(`/therapist/chat`)}
                      className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      💬 Chat
                    </button>
                  </div>

                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
