// SellerDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const SellerDashboard = () => {
  const [escrows, setEscrows] = useState([]);

  useEffect(() => {
    const fetchSellerEscrows = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/seller-escrows", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEscrows(res.data.escrows);
      } catch (err) {
        console.error("Error fetching seller escrows:", err);
      }
    };

    fetchSellerEscrows();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-2">Escrows Assigned to You</h2>
        {escrows.length === 0 ? (
          <p>No escrows found.</p>
        ) : (
          <table className="w-full text-sm table-auto">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Buyer</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Description</th>
                <th className="p-2">Status</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {escrows.map((escrow) => (
                <tr key={escrow.id} className="border-t">
                  <td className="p-2">{escrow.id}</td>
                  <td className="p-2">{escrow.buyer_email}</td>
                  <td className="p-2">₦{escrow.amount}</td>
                  <td className="p-2">{escrow.description}</td>
                  <td className="p-2 capitalize">{escrow.status}</td>
                  <td className="p-2">
                    {new Date(escrow.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
