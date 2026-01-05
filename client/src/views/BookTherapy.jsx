import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BookTherapy = () => {
  const [therapists, setTherapists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // UI Error State
  const navigate = useNavigate();
  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

  useEffect(() => {
    // Fetch Therapists
    axios
      .get("/auth/therapists")
      .then((res) => setTherapists(res.data))
      .catch((err) => console.error("Therapist fetch error:", err));

    // Fetch User Bookings
    const token = sessionStorage.getItem("token");
    axios
      .get("/bookings", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setBookings(res.data))
      .catch((err) => console.error("Booking fetch error:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // 1. Manual Validation
    if (!selectedTherapist) {
      setError("Please select a therapist from the list.");
      return;
    }
    if (!date) {
      setError("Please select a date for your session.");
      return;
    }
    if (!time) {
      setError("Please select a time for your session.");
      return;
    }

    setLoading(true);
    console.log("Submitting Booking:", { therapistId: selectedTherapist, date, time });

    try {
      await axios.post("/bookings", {
        therapistId: selectedTherapist,
        date,
        time
      });

      // alert("Appointment booked! Redirecting to payment...");
      navigate("/payment");
    } catch (err) {
      console.error("Booking error:", err);
      setError(err.response?.data?.message || "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Confirmed</span>
      case 'pending': return <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-xs font-bold">Pending</span>
      default: return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs font-bold">{status}</span>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-blue-100"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">Book a Session</h2>
          <p className="text-gray-500 font-medium">Choose your favorite therapist and schedule your healing journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Therapist</label>
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {therapists.map((t) => (
                  <label
                    key={t._id}
                    onClick={() => setSelectedTherapist(t._id)} // Click handler on label for better reliability
                    className={`relative flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedTherapist === t._id
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-100 hover:border-blue-200"
                      }`}
                  >
                    <input
                      type="radio"
                      name="therapist"
                      value={t._id}
                      className="hidden"
                      checked={selectedTherapist === t._id}
                      onChange={() => { }} // Controlled by onClick on label
                    />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-xl mr-4 shadow-inner flex-shrink-0 overflow-hidden">
                      {t.photoUrl ? (
                        <img src={`${socketUrl}${t.photoUrl}`} className="w-full h-full object-cover" alt={t.name} />
                      ) : (
                        t.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <p className={`font-bold ${selectedTherapist === t._id ? "text-blue-700" : "text-gray-700"}`}>{t.name}</p>
                      <p className="text-xs text-gray-400 font-medium lowercase">
                        {t.specializations?.length > 0 ? t.specializations[0] : "Licensed Specialist"}
                      </p>
                    </div>
                    {selectedTherapist === t._id && (
                      <div className="absolute right-4 text-blue-500 font-bold">✓</div>
                    )}
                  </label>
                ))}
                {therapists.length === 0 && (
                  <p className="text-gray-400 italic">Finding available therapists...</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-semibold outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-gray-100 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all font-semibold outline-none shadow-sm"
              />
            </div>

            <div className="pt-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4 text-sm font-bold border border-red-100 text-center animate-pulse">
                  ⚠️ {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:scale-100"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>✨ Book Appointment Now</>
                )}
              </motion.button>
              <p className="text-center text-xs text-gray-400 mt-4 font-medium italic">Secure payment will be requested in the next step.</p>
            </div>
          </div>
        </form>
      </motion.div>

      {/* 📅 MY SCHEDULED SESSIONS */}
      <div className="bg-white/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-blue-50">
        <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          📅 My Scheduled Sessions
        </h3>
        {bookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.filter(b => b.status !== 'cancelled' && b.status !== 'rejected').map(booking => (
              <div key={booking._id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold overflow-hidden shadow-inner">
                  {booking.therapist?.photoUrl ? (
                    <img src={`${socketUrl}${booking.therapist.photoUrl}`} className="w-full h-full object-cover" alt={booking.therapist.name} />
                  ) : (
                    booking.therapist?.name?.[0] || "T"
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{booking.therapist?.name}</p>
                  <p className="text-xs text-slate-500">{booking.date} @ {booking.time}</p>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">No upcoming sessions. Book one above!</p>
        )}
      </div>
    </div>
  );
};

export default BookTherapy;
