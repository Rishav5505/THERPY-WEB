import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // ✅ Configured instance
import { motion, AnimatePresence } from "framer-motion";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://mind-mend-final-backend.onrender.com";

const Patients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null); // For Profile Modal

  useEffect(() => {
    // 1. Get User/Therapist ID correctly
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    const user = JSON.parse(userStr);
    const therapistId = user._id; // ✅ Extract ID from user object

    // 2. Fetch Patients using configured axios
    // Note: ensure backend route supports token auth if changing to /patients/my-patients or similar. 
    // For now keeping the route but fixing the ID source.
    axios.get(`/patients/by-therapist/${therapistId}`)
      .then((res) => {
        setPatients(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError("Could not retrieve patient records.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-slate-900/5 border border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Patient Records</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 italic uppercase tracking-widest">Medical Database</p>
        </div>
        <div className="flex -space-x-3">
          {patients.slice(0, 5).map((p, i) => (
            <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 shadow-sm overflow-hidden">
              {p.photoUrl && <img src={`${socketUrl}${p.photoUrl}`} className="w-full h-full object-cover" />}
            </div>
          ))}
          {patients.length > 5 && (
            <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-600 text-white flex items-center justify-center font-black text-xs z-10">
              +{patients.length - 5}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Accessing Database...</p>
        </div>
      ) : error ? (
        <div className="p-10 bg-rose-50 border-2 border-rose-100 rounded-3xl text-center">
          <p className="text-rose-600 font-bold">{error}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl shadow-slate-950/5 overflow-hidden border border-slate-100 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Profile</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Joined</th>
                  <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {patients.map((p) => (
                  <PatientRow
                    key={p._id}
                    patient={p}
                    onViewProfile={() => setSelectedPatient(p)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {patients.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-bold italic">No patient records found in your directory.</p>
            </div>
          )}
        </div>
      )}

      {/* 👤 PATIENT PROFILE MODAL */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPatient(null)}
                className="absolute top-6 right-6 w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors font-bold"
              >
                ✕
              </button>

              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900 overflow-hidden mb-4 shadow-xl">
                  {selectedPatient.photoUrl ? (
                    <img src={`${socketUrl}${selectedPatient.photoUrl}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-4xl">👤</div>
                  )}
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">{selectedPatient.name}</h2>
                <p className="text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-xs uppercase tracking-widest">Active Patient</p>
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl mb-8">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                  <span className="text-sm font-bold text-slate-500">Email Address</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedPatient.email}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                  <span className="text-sm font-bold text-slate-500">Member Since</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{new Date(selectedPatient.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-500">Patient ID</span>
                  <span className="text-xs font-mono font-bold text-slate-400">#{selectedPatient._id.slice(-6)}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/therapist/chat')}
                  className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-colors"
                >
                  Start Chat 💬
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    navigate('/therapist/patient-progress');
                  }}
                  className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 hover:shadow-2xl transition-all"
                >
                  View Progress 📊
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function PatientRow({ patient, onViewProfile }) {
  const [preview, setPreview] = useState(patient.photoUrl ? `${socketUrl}${patient.photoUrl}` : "");
  const [uploading, setUploading] = useState(false);

  // ... (Keep handleFileChange as is, just updating the return)
  // Re-implementing handleFileChange for completeness in this chunk
  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setPreview(URL.createObjectURL(f));
    const formData = new FormData();
    formData.append("photo", f);
    setUploading(true);

    try {
      const res = await axios.post(`/patients/${patient._id}/photo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.user?.photoUrl) {
        setPreview(`${socketUrl}${res.data.user.photoUrl}`);
      }
    } catch (err) {
      alert("Profile update failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors"
    >
      <td className="px-8 py-6">
        <div className="relative w-16 h-16 group">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full rounded-2xl object-cover shadow-md border-2 border-white dark:border-slate-800" />
          ) : (
            <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">👤</div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-slate-900/50 rounded-2xl flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </td>
      <td className="px-8 py-6">
        <p className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{patient.name}</p>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Mental Health Patient</p>
      </td>
      <td className="px-8 py-6 text-sm font-bold text-indigo-600 dark:text-indigo-400">
        {patient.email}
      </td>
      <td className="px-8 py-6 text-sm font-bold text-slate-500">
        {new Date(patient.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-8 py-6">
        <div className="flex gap-2">
          <label className="cursor-pointer px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all text-sm font-bold text-slate-600">
            📷 Edit Photo
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
          <button
            onClick={onViewProfile}
            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm font-bold"
          >
            👤 View Profile
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default Patients;
