import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

const TherapistDashboard = () => {
  const [therapistName, setTherapistName] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.name) {
        setTherapistName(user.name);
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-blue-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-blue-200 p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-6">🧠 Therapist Panel</h2>
        <nav className="space-y-4 text-md">
          <li className="flex items-center gap-2 list-none">
            📅
            <Link to="/therapist/appointments" className="hover:underline">
              Appointments
            </Link>
          </li>
          <li className="flex items-center gap-2 list-none">
            🧑‍🤝‍🧑
            <Link to="/therapist/manage-patients" className="hover:underline">
              Manage Patients
            </Link>
          </li>
          <li className="flex items-center gap-2 list-none">
            📝
            <Link to="/therapist/session-notes" className="hover:underline">
              Session Notes
            </Link>
          </li>
          <li className="flex items-center gap-2 list-none">
            📹
            <Link to="/therapist/video-call" className="hover:underline">
              Video Call
            </Link>
          </li>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-10 bg-blue-50">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {therapistName || "Loading..."}
        </h1>
        <p className="text-lg mb-6">You have 3 upcoming sessions today.</p>

        {/* Outlet renders nested components here */}
        <Outlet />
      </main>
    </div>
  );
};

export default TherapistDashboard;
