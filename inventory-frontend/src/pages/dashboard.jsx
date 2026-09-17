import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Apni API ka base URL yahan configure karein
const API_BASE = "http://localhost:8080/inventory-api"; 

export default function Dashboard() {
  // Analytical Database Engine States
  const [counters, setCounters] = useState({ users: 0, categories: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  // Real-Time Sync Logic Engine
  const loadDashboardCounts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/get_dashboard_counts.php`);
      setCounters(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Real-time counters stream broken:", err);
    }
  };

  useEffect(() => {
    // First load execution
    loadDashboardCounts();

    // Set interval for live real-time synchronization every 3 seconds
    const liveSyncInterval = setInterval(() => {
      loadDashboardCounts();
    }, 3000);

    // Component unmount logic to clean interval process
    return () => clearInterval(liveSyncInterval);
  }, []);

  return (
    <div className="md:ml-0 pt-6 px-4">
      
      {/* HEADER META INFRASTRUCTURE */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight">System Analytics Dashboard</h1>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Real-time status overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
          Live Sync Engine Active
        </div>
      </div>

      {/* ─── LIVE SUMMARY CARDS WIDGETS ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* System Users Metrics Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white h-36 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col justify-between rounded-sm overflow-hidden">
          <div className="p-5 flex justify-between items-start">
            <div>
              <h1 className="text-md font-bold uppercase tracking-wide opacity-90">System Users</h1>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {loading ? "..." : counters.users}
              </p>
            </div>
            <i className="fa-solid fa-user text-5xl opacity-25"></i>
          </div>
          <div className="bg-blue-600/80 backdrop-blur-sm p-2 text-center text-xs font-semibold tracking-wider uppercase">More info ➜</div>
        </div>

        {/* Categories Matrix Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white h-36 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col justify-between rounded-sm overflow-hidden">
          <div className="p-5 flex justify-between items-start">
            <div>
              <h1 className="text-md font-bold uppercase tracking-wide opacity-90">Category</h1>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {loading ? "..." : counters.categories}
              </p>
            </div>
            <i className="fa-solid fa-list text-5xl opacity-25"></i>
          </div>
          <div className="bg-green-700/80 backdrop-blur-sm p-2 text-center text-xs font-semibold tracking-wider uppercase">More info ➜</div>
        </div>

        {/* Live Products Metrics Card */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white h-36 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col justify-between rounded-sm overflow-hidden">
          <div className="p-5 flex justify-between items-start">
            <div>
              <h1 className="text-md font-bold uppercase tracking-wide opacity-90">Product</h1>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {loading ? "..." : counters.products}
              </p>
            </div>
            <i className="fa-solid fa-cubes text-5xl opacity-25"></i>
          </div>
          <div className="bg-orange-600/80 backdrop-blur-sm p-2 text-center text-xs font-semibold tracking-wider uppercase">More info ➜</div>
        </div>

        {/* Operational Orders Matrix Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white h-36 shadow-lg hover:-translate-y-1.5 hover:shadow-2xl transition duration-300 cursor-pointer flex flex-col justify-between rounded-sm overflow-hidden">
          <div className="p-5 flex justify-between items-start">
            <div>
              <h1 className="text-md font-bold uppercase tracking-wide opacity-90">Orders</h1>
              <p className="text-3xl font-black mt-2 tracking-tight">
                {loading ? "..." : counters.orders}
              </p>
            </div>
            <i className="fa-solid fa-basket-shopping text-5xl opacity-25"></i>
          </div>
          <div className="bg-red-700/80 backdrop-blur-sm p-2 text-center text-xs font-semibold tracking-wider uppercase">More info ➜</div>
        </div>

      </div>

      {/* QUICK SYSTEM STATUS UPDATE */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 text-gray-500 rounded text-sm flex items-center gap-2">
        <i className="fa-solid fa-circle-info text-blue-500"></i>
        <span>Dashboard tables have been migrated to dedicated operational viewpoints. Cards represent live synced state metrics.</span>
      </div>

    </div>
  );
}