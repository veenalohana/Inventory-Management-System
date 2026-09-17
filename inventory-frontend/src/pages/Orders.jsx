import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Orders() {
  // 1. Dynamic Database Dataset State
  const [orders, setOrders] = useState([]);

  // 2. Control States (Search, Filters, aur Modal Controller)
  const [searchVal, setSearchVal] = useState("");
  const [customerFilter, setCustomerFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view' ya 'edit'
  const [formData, setFormData] = useState({
    id: "",
    customer: "",
    products: 0,
    amount: 0.0,
    paymentStatus: "Paid",
    orderStatus: "Pending",
    date: ""
  });

  // Fetch orders from database on mount
  useEffect(() => {
    fetchOrdersHistory();
  }, []);

  const fetchOrdersHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_orders.php`);
      if(Array.isArray(response.data)) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching inventory transaction logs:", error);
    }
  };

  // 3. Live Dashboard Metric Counters using useMemo
  const metrics = useMemo(() => {
    let pending = 0;
    let completed = 0;
    let cancelled = 0;

    orders.forEach(o => {
      if (o.orderStatus === "Pending") pending++;
      if (o.orderStatus === "Completed") completed++;
      if (o.orderStatus === "Cancelled") cancelled++;
    });

    return {
      total: orders.length,
      pending,
      completed,
      cancelled
    };
  }, [orders]);

  // Unique customers list drop-down filters dynamically mapped
  const uniqueCustomers = useMemo(() => {
    return ["All", ...new Set(orders.map(o => o.customer).filter(Boolean))];
  }, [orders]);

  // 4. Input Field Change Handlers
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const fieldMap = {
      formCustomer: "customer",
      formProducts: "products",
      formAmount: "amount",
      formPaymentStatus: "paymentStatus",
      formOrderStatus: "orderStatus",
      formDate: "date"
    };
    setFormData({ ...formData, [fieldMap[id]]: value });
  };

  // 5. Open Modal Trigger Rules (View / Edit)
  const openModal = (id, mode) => {
    const o = orders.find(item => item.id === id);
    if (o) {
      setModalMode(mode);
      setFormData({ ...o });
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  // Save changes handler for Edit Mode (Updates Database)
  const saveOrderEdits = async () => {
    try {
      const response = await axios.post(`${API_URL}/update_order_status.php`, {
        id: formData.id,
        paymentStatus: formData.paymentStatus,
        orderStatus: formData.orderStatus
      });

      if (response.data.success) {
        alert("Order parameters updated successfully inside core engine.");
        fetchOrdersHistory();
        closeModal();
      } else {
        alert("Update Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Failed transmission routing:", error);
    }
  };

  // Delete Order Record Handler
  const deleteOrder = async (id) => {
    if (window.confirm("Are you sure you want to completely drop this order trace from database?")) {
      try {
        const response = await axios.post(`${API_URL}/delete_order.php`, { id });
        if (response.data.success) {
          alert("Order dropped.");
          fetchOrdersHistory();
        }
      } catch (error) {
        console.error("Deletion system engine failure:", error);
      }
    }
  };

  // 6. Dynamic Real-time Multi-Filter computation
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const orderIdString = String(o.id || "");
      const customerName = o.customer || "";
      const orderDateStr = o.date || "";

      const matchesSearch = orderIdString.toLowerCase().includes(searchVal.toLowerCase()) || 
                            customerName.toLowerCase().includes(searchVal.toLowerCase());
      
      const matchesCustomer = customerFilter === "All" || customerName === customerFilter;
      const matchesStatus = statusFilter === "All" || o.orderStatus === statusFilter;
      const matchesDate = dateFilter === "" || orderDateStr.startsWith(dateFilter);

      return matchesSearch && matchesCustomer && matchesStatus && matchesDate;
    });
  }, [orders, searchVal, customerFilter, statusFilter, dateFilter]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      
      {/* METRICS SUMMARY COUNTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded shadow border-l-4 border-green-600 flex items-center justify-between hover:-translate-y-1 transition">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.total}</h1>
          </div>
          <div className="text-green-600 text-2xl bg-green-50 p-3 rounded-lg">
            <i className="fa-solid fa-folder-open"></i>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded shadow border-l-4 border-amber-500 flex items-center justify-between hover:-translate-y-1 transition">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Orders</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.pending}</h1>
          </div>
          <div className="text-amber-500 text-2xl bg-amber-50 p-3 rounded-lg">
            <i className="fa-solid fa-clock"></i>
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-5 rounded shadow border-l-4 border-emerald-500 flex items-center justify-between hover:-translate-y-1 transition">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.completed}</h1>
          </div>
          <div className="text-emerald-500 text-2xl bg-emerald-50 p-3 rounded-lg">
            <i className="fa-solid fa-circle-check"></i>
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white p-5 rounded shadow border-l-4 border-red-500 flex items-center justify-between hover:-translate-y-1 transition">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cancelled</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.cancelled}</h1>
          </div>
          <div className="text-red-500 text-2xl bg-red-50 p-3 rounded-lg">
            <i className="fa-solid fa-ban"></i>
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE FILTER MATRIX AND TABLES CONTAINER CARD */}
      <div className="bg-white border-t-4 border-green-600 p-5 shadow rounded">
        <div className="mb-5 flex flex-wrap justify-between items-center gap-4">
          <h2 className="text-xl font-bold text-gray-800">Sales Orders Dashboard</h2>
          <input 
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 text-xs rounded w-full sm:w-64 focus:outline-none focus:border-green-600"
            placeholder="Search Order ID or Customer..."
          />
        </div>

        {/* FILTERS TOOLBAR CONTROLS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 bg-gray-50 p-3 rounded border">
          <div>
            <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Customer Filter</label>
            <select 
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="border p-2 text-xs rounded w-full bg-white focus:outline-none focus:border-green-600 font-semibold"
            >
              {uniqueCustomers.map(c => <option key={c} value={c}>{c === "All" ? "All Customers" : c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Status Matrix</label>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 text-xs rounded w-full bg-white focus:outline-none focus:border-green-600 font-semibold"
            >
              <option value="All">All Orders Status</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-extrabold text-gray-500 mb-1">Date Specification</label>
            <input 
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border p-2 text-xs rounded w-full bg-white focus:outline-none focus:border-green-600"
            />
          </div>
        </div>

        {/* RESPONSIVE SYSTEM ORDERS TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[800px] text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b text-center">
              <tr>
                <th className="p-3 border w-28">Order ID</th>
                <th className="border text-left pl-4">Customer Name</th>
                <th className="border w-24">Products</th>
                <th className="border w-32">Total Amount</th>
                <th className="border w-32">Date</th>
                <th className="border w-32">Payment</th>
                <th className="border w-32">Status</th>
                <th className="border w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-center text-gray-600">
              {filteredOrders.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/80 transition">
                  <td className="p-3 border font-semibold text-gray-900">ORD-{item.id}</td>
                  <td className="border text-left pl-4 font-medium text-gray-900">{item.customer}</td>
                  <td className="border font-medium">{item.products}</td>
                  <td className="border font-bold text-gray-800">Rs {parseFloat(item.amount || 0).toFixed(2)}</td>
                  <td className="border text-xs font-semibold">{item.date}</td>
                  <td className="border">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.paymentStatus === "Paid" ? 'bg-green-100 text-green-700' :
                      item.paymentStatus === "Unpaid" ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="border">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      item.orderStatus === "Completed" ? 'text-green-600' :
                      item.orderStatus === "Pending" ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {item.orderStatus}
                    </span>
                  </td>
                  <td className="border space-x-1">
                    <button 
                      onClick={() => openModal(item.id, 'view')}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2.5 py-1 rounded transition shadow-sm"
                    >
                      <i className="fa-solid fa-eye"></i>
                    </button>
                    <button 
                      onClick={() => openModal(item.id, 'edit')}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-2.5 py-1 rounded transition shadow-sm"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={() => deleteOrder(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded transition shadow-sm"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-5 text-gray-400 bg-gray-50 font-medium">
                    No order transactions matched filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* UNIFIED DYNAMIC MODAL CONTAINER (VIEW / EDIT) */}
      {isOpen && (
        <div id="orderModal" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto transform transition-all animate-fadeIn">
            <h2 id="modalTitle" className="text-xl font-bold mb-4 text-gray-800">
              {modalMode === 'view' ? "Order Details Matrix" : "Edit Order Parameters"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Customer Name</label>
                <input 
                  type="text" id="formCustomer" value={formData.customer} onChange={handleInputChange} 
                  disabled={true} 
                  className="border p-2 w-full text-sm rounded bg-gray-100 text-gray-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Total Products Ordered</label>
                <input 
                  type="number" id="formProducts" value={formData.products} onChange={handleInputChange}
                  disabled={true}
                  className="border p-2 w-full text-sm rounded bg-gray-100 text-gray-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Total Billing Amount (Rs)</label>
                <input 
                  type="number" id="formAmount" value={formData.amount} onChange={handleInputChange}
                  disabled={true}
                  className="border p-2 w-full text-sm rounded bg-gray-100 text-gray-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Clearance Status</label>
                <select 
                  id="formPaymentStatus" value={formData.paymentStatus} onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="border p-2 w-full text-sm rounded bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 bg-white focus:outline-none focus:border-green-600"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Order Log Status</label>
                <select 
                  id="formOrderStatus" value={formData.orderStatus} onChange={handleInputChange}
                  disabled={modalMode === 'view'}
                  className="border p-2 w-full text-sm rounded bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 bg-white focus:outline-none focus:border-green-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Transaction Log Date</label>
                <input 
                  type="text" id="formDate" value={formData.date} disabled={true}
                  className="border p-2 w-full text-sm rounded bg-gray-100 text-gray-500" 
                />
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex justify-end gap-2 mt-6 pt-3 border-t">
              <button 
                onClick={closeModal} 
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600 transition"
              >
                Close
              </button>
              {modalMode === 'edit' && (
                <button 
                  id="saveModalBtn" onClick={saveOrderEdits}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition shadow"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}