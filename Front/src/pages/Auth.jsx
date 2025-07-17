import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  // State to toggle between register and login
  const [isRegister, setIsRegister] = useState(true);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("buyer"); // default role

  const navigate = useNavigate();

  // Modified handleRegister
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        email,
        password,
        role, // convert to boolean
      });

      setMessage("✅ Registered successfully! You can now log in.");
      setIsRegister(false);
    } catch (err) {
      console.error(err);
      setMessage("❌ Registration failed.");
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        {
          email,
          password,
        }
      );

      const token = response.data.token;
      const isSeller = response.data.user.is_seller;

      // Save token
      localStorage.setItem("token", token);

      // Redirect based on role
      if (isSeller) {
        navigate("/seller"); // 👈 go to seller dashboard
      } else {
        navigate("/dashboard"); // 👈 go to buyer dashboard
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Login failed.");
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
        <AnimatePresence mode="wait">
          {isRegister ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white text-center font-inter">
                Create Account
              </h2>
              <form onSubmit={handleRegister} className="space-y-5">
                {/* Role Dropdown */}
                <div>
                  <label className="block text-sm text-white mb-1">
                    Registering As
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-lg px-4 py-2 bg-black backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-white/70"
                    required
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </div>

                {/* Email Input */}
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

                {/* Password Input */}
                <div>
                  <label className="block text-sm text-white mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-lg px-4 py-2 bg-white/30 backdrop-blur border border-white/30 focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-white/70"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-accent text-white font-semibold hover:bg-pink-500 transition"
                >
                  Register
                </button>
              </form>

              {message && (
                <p className="text-center text-sm mt-2 text-white">{message}</p>
              )}
              <p className="text-center text-white text-sm mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setMessage("");
                  }}
                  className="underline hover:text-accent"
                >
                  Log in
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-white text-center font-inter">
                Welcome Back
              </h2>
              <form onSubmit={handleLogin} className="space-y-5">
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
                  <label className="block text-sm text-white mb-1">
                    Password
                  </label>
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
              </form>
              {message && (
                <p className="text-center text-sm mt-2 text-white">{message}</p>
              )}
              <p className="text-center text-white text-sm mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setMessage("");
                  }}
                  className="underline hover:text-accent"
                >
                  Register
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
