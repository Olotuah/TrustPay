import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Login() {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email,
        password,
      });

      // Save the JWT token in localStorage for now
      localStorage.setItem("token", res.data.token);

      setMessage("✅ Login successful!");
      // Redirect to dashboard or home
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      setMessage("❌ Invalid email or password.");
    }
  };

  return (
    <div className="min-h-screen animate-gradient flex items-center justify-center font-manrope relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full bg-white/20 backdrop-blur-2xl rounded-3xl shadow-xl p-8 border border-white/30 hover:bg-white/30 transition duration-300"
      >
        <h2 className="text-3xl font-bold mb-6 text-white text-center font-inter">
          Welcome Back
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

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-pink-500 transition"
          >
            Log In
          </button>

          {message && (
            <p className="text-center text-sm mt-2 text-white">{message}</p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
