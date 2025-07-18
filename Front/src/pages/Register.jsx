import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // ✅ added role state
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // ✅ Send role to backend too
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        email,
        password,
        role,
      });
      setMessage("✅ Registration successful!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error registering user.");
    }
  };

  return (
    <div className="min-h-screen animate-gradient flex items-center justify-center font-manrope relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full bg-white/20 bg-opacity-30 backdrop-blur-2xl rounded-3xl shadow-xl p-8 border border-white/20"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center font-inter">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg px-4 py-2 bg-white/30 backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-white/70"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-white mb-1">Password</label>
            <input
              type="password"
              className="w-full rounded-lg px-4 py-2 bg-white/30 backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-white/70"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* ✅ Role Dropdown */}
          <div>
            <label className="block text-sm text-white mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg px-4 py-2 bg-white/30 backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent text-white"
              required
            >
              <option value="">Select role</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-pink-500 transition"
          >
            Register
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-white">{message}</p>
          )}
        </form>
      </motion.div>

      {/* Decorative blurred circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-pink-400 rounded-full opacity-30 filter blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-30 filter blur-3xl"></div>
    </div>
  );
}
