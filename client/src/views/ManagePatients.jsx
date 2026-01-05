import { useEffect, useState } from "react";

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const therapistId = sessionStorage.getItem("therapistId");
    console.log("➡ Therapist ID:", therapistId);

    if (!therapistId) {
      setError("Therapist ID not found. Please login again.");
      setLoading(false);
      return;
    }

    const baseUrl = import.meta.env.VITE_API_BASE_URL || "https://mind-mend-final-backend.onrender.com/api";
    fetch(`${baseUrl}/patients/by-therapist/${therapistId}`)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        console.log("📥 Patients data:", data);
        setPatients(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch error:", err);
        setError("Failed to load patients. Please try again.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6 bg-blue-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">👥 Manage Patients</h1>

      {loading ? (
        <p>🔄 Loading patients...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table className="w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Registered</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.email}</td>
                <td className="p-2">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
