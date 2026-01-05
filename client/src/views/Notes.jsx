import { useEffect, useState } from "react";
import axios from "../api/axios";

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    patientId: "",
    note: "",
  });
  const [patients, setPatients] = useState([]);
  const user = JSON.parse(sessionStorage.getItem("user")); // therapist

  // Fetch therapist's patients for dropdown
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`/patients/by-therapist/${user._id}`);
        setPatients(res.data);
      } catch (err) {
        setPatients([]);
      }
    };
    if (user?._id) fetchPatients();
  }, [user]);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const res = await axios.get("/session-notes");
      setNotes(res.data);
    } catch (error) {
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.patientId || !newNote.note) {
      return alert("All fields are required.");
    }
    try {
      await axios.post("/session-notes", newNote);
      setNewNote({ patientId: "", note: "" });
      fetchNotes();
    } catch (error) {
      alert("Failed to add note");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-purple-700 mb-6">Session Notes</h2>

      <form onSubmit={handleAddNote} className="space-y-4 mb-8">
        <select
          value={newNote.patientId}
          onChange={(e) => setNewNote({ ...newNote, patientId: e.target.value })}
          className="w-full border rounded p-2"
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
          ))}
        </select>
        <textarea
          placeholder="Write session note..."
          value={newNote.note}
          onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
          className="w-full border rounded p-2"
          rows="4"
        ></textarea>
        <button
          type="submit"
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
        >
          Add Note
        </button>
      </form>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes found.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="border rounded p-4 bg-gray-50 shadow-sm"
            >
              <h4 className="font-semibold text-lg text-purple-700">
                Patient: {note.patient?.name || "Unknown"}
              </h4>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {note.note}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Date: {note.date ? new Date(note.date).toLocaleDateString() : ""}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notes;
