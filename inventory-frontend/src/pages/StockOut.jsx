import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

// Backend API URL Base path
const API_URL = "http://localhost:8080/inventory-api";

export default function StockOut() {
  // 1. Core States Linked to Database Logs
  const [stockOut, setStockOut] = useState([]);
  const [productsList, setProductsList] = useState([]); // Products dropdown ke liye state

  // 2. Control States (Modal Toggle & Search)
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // 3. Form Input States
  const [formData, setFormData] = useState({
    product_id: "", // Product text field ki jagah product_id store hogi
    customer: "",
    qty: "",
    price: "",
    date: new Date().toISOString().split('T')[0], // Default today's date
    remarks: ""
  });

  // Fetch all stock out history and products list on mount
  useEffect(() => {
    fetchStockOutHistory();
    fetchProductsList();
  }, []);

  const fetchStockOutHistory = async () => {
    try {
      // Note: Aapke backend API folder mein get_stock_out.php ya sales/orders ke endpoint ke mutabiq link set karein
      const response = await axios.get(`${API_URL}/get_stock_out.php`);
      if (Array.isArray(response.data)) {
        setStockOut(response.data);
      }
    } catch (error) {
      console.error("Error fetching stock out history:", error);
    }
  };

  const fetchProductsList = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_products.php`);
      if (Array.isArray(response.data)) {
        setProductsList(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProductsList(response.data.data);
      } else if (response.data && Array.isArray(response.data.products)) {
        setProductsList(response.data.products);
      }
    } catch (error) {
      console.error("Error fetching products list:", error);
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Open Modal Handler
  const openModal = () => {
    setFormData({
      product_id: "",
      customer: "",
      qty: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
      remarks: ""
    });
    setIsOpen(true);
  };

  // Close Modal Handler
  const closeModal = () => setIsOpen(false);

  // Save Stock Out Logic (Connected to Database)
  const saveOut = async () => {
    const { product_id, customer, qty, price, date, remarks } = formData;

    if (!product_id || !customer || !qty || !price || !date) {
      alert("Please populate all necessary input fields.");
      return;
    }

    try {
      // Note: Aapke place_order.php ya save_stock_out.php endpoint ke mutabiq payload check kar sakte hain
      const response = await axios.post(`${API_URL}/save_stock_out.php`, {
        product_id: parseInt(product_id),
        customer_name: customer,
        qty: parseInt(qty),
        price: parseFloat(price),
        date,
        remarks
      });

      if (response.data.success) {
        alert("Stock out transaction recorded successfully!");
        fetchStockOutHistory(); // Live table aur counters refresh karne ke liye
        closeModal();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Transmission breakdown error:", error);
      alert("Failed to connect to backend server framework.");
    }
  };

  // Delete Stock Out Record
  const deleteOut = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this stock out entry?")) {
      try {
        const response = await axios.post(`${API_URL}/delete_stock_out.php`, { id });
        if (response.data.success) {
          alert("Stock out log removed successfully.");
          fetchStockOutHistory();
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Failed connection to engine deletion server:", error);
      }
    }
  };

  // View Details Handler
  const viewOut = (id) => {
    const s = stockOut.find(item => item.id === id);
    if (s) {
      alert(
        "Product: " + s.product +
        "\nCustomer: " + s.customer +
        "\nQuantity Logged: " + s.qty +
        "\nTotal Amount: Rs. " + (parseInt(s.qty || 0) * parseFloat(s.price || 0)).toLocaleString() +
        "\nDate: " + s.date +
        "\nRemarks: " + (s.remarks || "N/A")
      );
    }
  };

  // 4. Dynamic Counter Cards Calculations using useMemo (Records Count Logic)
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayCount = 0;
    let totalRecordsCount = 0; // Ab hum items quantities sum nahi balki rows count karenge
    let totalRevenue = 0;

    stockOut.forEach(item => {
      totalRecordsCount += 1; // Fixed: Qty ki jagah counter 1 se increment hoga
      totalRevenue += (parseInt(item.qty || 0) * parseFloat(item.price || 0));
      
      if (item.date === todayStr) {
        todayCount += 1; // Fixed: Aaj ki unique records/entries counts
      }
    });

    return {
      todayCount: todayCount,        // Today's Stock Out Entries Count
      totalQty: totalRecordsCount,   // Total Out Records/Logs Count
      totalValue: totalRevenue       // Total Financial Value Total
    };
  }, [stockOut]);

  // Live Filtered Search History Row Computation
  const filteredStockOut = useMemo(() => {
    return stockOut.filter(item => 
      (item.product && item.product.toLowerCase().includes(searchVal.toLowerCase())) ||
      (item.customer && item.customer.toLowerCase().includes(searchVal.toLowerCase())) ||
      String(item.id).toLowerCase().includes(searchVal.toLowerCase())
    );
  }, [stockOut, searchVal]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      
      {/* 3 DYNAMIC TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Stock Out */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-cart-arrow-down text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Today's Stock Out</h1>
              <h2 className="text-3xl font-semibold">{metrics.todayCount}</h2>
            </div>
          </div>
        </div>

        {/* Total Items Sold / Out Records */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-box text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Total Stock Out Logs</h1>
              <h2 className="text-3xl font-semibold">{metrics.totalQty}</h2>
            </div>
          </div>
        </div>

        {/* Total Amount Earned */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-hand-holding-dollar text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Total Revenue</h1>
              <h2 className="text-3xl font-semibold">Rs. {metrics.totalValue.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* CORE STOCK OUT HISTORY TABLE */}
      <div className="mt-5 bg-white border-t-4 border-green-600 p-5 shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Stock Out History</h2>
          <button 
            onClick={openModal}
            className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 transition"
          >
            + Stock Out
          </button>
        </div>

        <input 
          id="search"
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="border p-2 rounded mb-4 focus:outline-none focus:border-green-600 text-sm w-full sm:w-64"
          placeholder="Search Product, Customer or ID..."
        />

        <div className="overflow-x-auto">
          <table className="w-full border min-w-[700px] text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
              <tr className="text-center">
                <th className="p-3 border">ID</th>
                <th className="border text-left pl-4">Product</th>
                <th className="border text-left pl-4">Customer</th>
                <th className="border">Quantity</th>
                <th className="border">Selling Price</th>
                <th className="border">Total Amount</th>
                <th className="border">Date</th>
                <th className="border">Status</th>
                <th className="border">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredStockOut.map((item, index) => (
                <tr key={item.id} className="text-center hover:bg-gray-50 border-b transition">
                  <td className="p-3 border font-semibold text-gray-900">
                    {item.id && String(item.id).startsWith("SO") ? item.id : `SO-${item.id}`}
                  </td>
                  <td className="border text-left pl-4 font-medium text-gray-900">{item.product}</td>
                  <td className="border text-left pl-4">{item.customer}</td>
                  <td className="border font-semibold">{item.qty}</td>
                  <td className="border">Rs {parseFloat(item.price || 0).toLocaleString()}</td>
                  <td className="border font-semibold text-green-700">Rs {(parseInt(item.qty || 0) * parseFloat(item.price || 0)).toLocaleString()}</td>
                  <td className="border text-xs font-semibold">{item.date}</td>
                  <td className="border">
                    <span className="px-2.5 py-0.5 rounded text-xs bg-green-100 text-green-700 font-bold">
                      {item.status || "Completed"}
                    </span>
                  </td>
                  <td className="border space-x-1.5">
                    <button 
                      onClick={() => viewOut(item.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs shadow-sm"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => deleteOut(item.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs shadow-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStockOut.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center p-5 text-gray-400 bg-gray-50 font-medium">
                    No stock out transaction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK OUT MODAL POPUP */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Stock Out Form</h2>
            
            <div className="space-y-3">
              {/* Dropdown Select Box for Dynamic Products List */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Select Product Element</label>
                <select
                  id="product_id"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  className="border p-2 w-full rounded text-sm bg-white focus:border-green-600 focus:outline-none text-gray-700"
                >
                  <option value="">-- Choose Product --</option>
                  {productsList.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} (Stock: {prod.stock_qty ?? 0})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Customer Client Name</label>
                <input id="customer" value={formData.customer} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Customer Name" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Quantity</label>
                  <input id="qty" type="number" value={formData.qty} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Selling Price (Rs)</label>
                  <input id="price" type="number" value={formData.price} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Price" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Log Date</label>
                <input id="date" type="date" value={formData.date} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Remarks / Details</label>
                <textarea id="remarks" value={formData.remarks} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Remarks"></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={saveOut} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}