import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // ✅ Custom axios instance

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form);

      // ✅ Save token and user info in sessionStorage (Tab-specific)
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Navigate based on role
      if (res.data.user.role === "therapist") navigate("/therapist");
      else navigate("/patient");
    } catch (err) {
      console.error(err);
      alert("❌ Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-purple-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-80 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center text-purple-600">Log In</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full px-3 py-2 border rounded"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700">
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;
