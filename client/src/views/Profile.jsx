import { useState, useEffect } from "react";
import axios from "../api/axios";
import { motion } from "framer-motion";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "https://therpy-web.onrender.com";

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    // Form States
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [interests, setInterests] = useState("");
    const [specializations, setSpecializations] = useState("");
    const [photo, setPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/users/profile");
            const u = res.data;
            setUser(u);
            setName(u.name || "");
            setBio(u.bio || "");
            setInterests(u.interests?.join(", ") || "");
            setSpecializations(u.specializations?.join(", ") || "");
            setPreviewUrl(u.photoUrl ? `${socketUrl}${u.photoUrl}` : "");
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        if (!photo) return;
        setSaving(true);
        const formData = new FormData();
        formData.append("photo", photo);

        try {
            const res = await axios.post("/users/upload-photo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMessage("✅ Photo uploaded successfully!");
            // Update local user photoUrl if needed
            setUser(prev => ({ ...prev, photoUrl: res.data.photoUrl }));
            // Also update sessionStorage user data
            const storedUser = JSON.parse(sessionStorage.getItem("user"));
            if (storedUser) {
                storedUser.photoUrl = res.data.photoUrl;
                sessionStorage.setItem("user", JSON.stringify(storedUser));
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Photo upload failed.");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        setMessage("");
        try {
            const res = await axios.put("/users/profile", {
                name,
                bio,
                interests: interests.split(",").map(i => i.trim()).filter(i => i !== ""),
                specializations: specializations.split(",").map(s => s.trim()).filter(s => s !== ""),
            });
            setUser(res.data.user);
            setMessage("✅ Profile updated successfully!");

            // Update sessionStorage user data
            const storedUser = JSON.parse(sessionStorage.getItem("user"));
            if (storedUser) {
                storedUser.name = name;
                sessionStorage.setItem("user", JSON.stringify(storedUser));
            }
        } catch (err) {
            console.error(err);
            setMessage("❌ Update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-bold">Syncing Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                    🎨 Profile Customization
                </h2>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-2xl mb-6 text-sm font-bold text-center ${message.includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
                    >
                        {message}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Photo Section */}
                    <div className="flex flex-col items-center space-y-6">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full border-4 border-indigo-100 dark:border-indigo-900 overflow-hidden shadow-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                ) : (
                                    <span className="text-6xl">👤</span>
                                )}
                            </div>
                            <label htmlFor="photo-upload" className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors border-4 border-white dark:border-slate-900 hover:scale-110 active:scale-95">
                                📷
                                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                            </label>
                        </div>

                        {photo && (
                            <button
                                onClick={handleUploadPhoto}
                                disabled={saving}
                                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
                            >
                                {saving ? "Uploading..." : "Click to Save New Photo"}
                            </button>
                        )}

                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                            Member Since: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Info Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Your display name"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Bio / About You</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                ></textarea>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Interests (comma separated)</label>
                                <input
                                    type="text"
                                    value={interests}
                                    onChange={(e) => setInterests(e.target.value)}
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                    placeholder="Anxiety, Mindfulness, Yoga..."
                                />
                            </div>

                            {user.role === 'therapist' && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Medical Specializations (Doctor Only)</label>
                                    <input
                                        type="text"
                                        value={specializations}
                                        onChange={(e) => setSpecializations(e.target.value)}
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        placeholder="Psychiatry, CBT, Child Psychology..."
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {saving ? "🔄 Saving Details..." : "💾 Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
