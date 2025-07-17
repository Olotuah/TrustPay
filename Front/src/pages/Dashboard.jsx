import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [sellerEmail, setSellerEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [releaseMessage, setReleaseMessage] = useState("");
  const [createMessage, setCreateMessage] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  // Load escrows
  const fetchEscrows = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const res = await axios.get(`${API}/buyer/escrows`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEscrows(res.data);
    } catch (err) {
      console.error(err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrows();
  }, [navigate]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Create escrow
  const handleCreateEscrow = async (e) => {
    e.preventDefault();
    setCreateMessage("");

    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        `${API}/create-escrow`,
        {
          seller_email: sellerEmail,
          amount,
          description,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newEscrow = res.data.escrow;
      setEscrows((prev) => [newEscrow, ...prev]);

      setCreateMessage("✅ Escrow created!");
      setTimeout(() => setCreateMessage(""), 4000);

      setSellerEmail("");
      setAmount("");
      setDescription("");
      setShowCreate(false);
    } catch (err) {
      console.error(err);
      setCreateMessage("❌ Failed to create escrow.");
      setTimeout(() => setCreateMessage(""), 4000);
    }
  };

  // Cancel escrow
  const handleCancelEscrow = async (escrowId) => {
    setCancelMessage("");
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/cancel-escrow`,
        { escrow_id: escrowId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCancelMessage("✅ Escrow cancelled successfully!");
      setTimeout(() => setCancelMessage(""), 4000);

      fetchEscrows();
    } catch (err) {
      console.error(err);
      setCancelMessage("❌ Failed to cancel escrow.");
      setTimeout(() => setCancelMessage(""), 4000);
    }
  };

  // Release payment
  const handleReleasePayment = async (escrowId) => {
    setReleaseMessage("");
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API}/release-payment`,
        { escrow_id: escrowId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReleaseMessage("✅ Payment released successfully!");
      setTimeout(() => setReleaseMessage(""), 4000);

      fetchEscrows();
    } catch (err) {
      console.error(err);
      setReleaseMessage("❌ Failed to release payment.");
      setTimeout(() => setReleaseMessage(""), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200"
      >
        {/* Feedback Messages */}
        {cancelMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm mt-2 text-red-600"
          >
            {cancelMessage}
          </motion.p>
        )}

        {releaseMessage && (
          <p className="text-center text-sm mt-2 text-green-600">
            {releaseMessage}
          </p>
        )}

        {createMessage && (
          <p className="text-center text-sm mt-2 text-indigo-600">
            {createMessage}
          </p>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Escrows</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-900 transition"
          >
            Log Out
          </button>
        </div>

        {/* Loading and Empty State */}
        {loading ? (
          <p className="text-gray-700">Loading...</p>
        ) : escrows.length === 0 ? (
          <p className="text-gray-700">You have no escrows yet.</p>
        ) : (
          <div className="grid gap-4">
            {escrows.map((escrow) => (
              <div
                key={escrow.id}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition"
              >
                <p className="text-gray-900">
                  <strong>Seller:</strong> {escrow.seller_email}
                </p>
                <p className="text-gray-900">
                  <strong>Amount:</strong> ₦{escrow.amount}
                </p>
                <p className="text-gray-900">
                  <strong>Status:</strong> {escrow.status}
                </p>
                <p className="text-gray-700 text-sm opacity-80">
                  Created: {new Date(escrow.created_at).toLocaleString()}
                </p>

                {/* Buttons for pending escrows */}
                {escrow.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleCancelEscrow(escrow.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition text-sm"
                    >
                      Cancel Escrow
                    </button>
                    <button
                      onClick={() => handleReleasePayment(escrow.id)}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition text-sm"
                    >
                      Release Payment
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            + Create New Escrow
          </button>

          {/* Create Modal */}
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50"
            >
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
                <h3 className="text-xl font-bold mb-4 text-gray-900">
                  Create New Escrow
                </h3>
                <input
                  type="email"
                  placeholder="Seller Email"
                  className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sellerEmail}
                  onChange={(e) => setSellerEmail(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <textarea
                  placeholder="Description"
                  className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <button
                  onClick={handleCreateEscrow}
                  className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Submit
                </button>
                {createMessage && (
                  <p className="text-center text-sm mt-2 text-indigo-600">
                    {createMessage}
                  </p>
                )}
                <button
                  onClick={() => setShowCreate(false)}
                  className="mt-3 w-full text-sm text-gray-500 underline"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
