import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

// Backend API URL Base path
const API_URL = "http://localhost:8080/inventory-api";

export default function StockIn() {
  // 1. Initial State empty rakha hai jo database se load hoga
  const [stocks, setStocks] = useState([]);

  // 2. Control States (Modal & Search)
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // 3. Form Input States
  const [formData, setFormData] = useState({
    product: "",
    supplier: "",
    category: "",
    qty: "",
    price: "",
    date: new Date().toISOString().split('T')[0], // Default today's date
    remarks: ""
  });

  // Database se Stock In History load karne ke liye useEffect
  useEffect(() => {
    fetchStockInHistory();
  }, []);

  const fetchStockInHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_stock_in.php`);
      if (Array.isArray(response.data)) {
        setStocks(response.data);
      }
    } catch (error) {
      console.error("Error fetching stock history:", error);
    }
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Modal Controllers
  const openModal = () => {
    setFormData({
      product: "",
      supplier: "",
      category: "",
      qty: "",
      price: "",
      date: new Date().toISOString().split('T')[0],
      remarks: ""
    });
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  // Save Stock In Logic (Connected to Database)
  const saveStock = async () => {
    const { product, supplier, category, qty, price, date, remarks } = formData;

    if (!product || !supplier || !qty || !price || !date) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/save_stock_in.php`, {
        product,
        supplier,
        category: category || "General",
        qty: parseInt(qty),
        price: parseFloat(price),
        date,
        remarks
      });

      if (response.data.success) {
        alert("Stock record processed successfully!");
        fetchStockInHistory(); // Table ko auto refresh karne ke liye
        closeModal();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to connect to server backend.");
    }
  };

  // Delete Stock Record Handler (Connected to Database)
  const deleteStock = async (id) => {
    if (window.confirm("Are you sure you want to delete this stock entry?")) {
      try {
        const response = await axios.post(`${API_URL}/delete_stock_in.php`, { id: parseInt(id) });
        if (response.data.success) {
          alert("Stock log removed successfully.");
          fetchStockInHistory(); // Table refresh
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Deletion error:", error);
      }
    }
  };

  // 4. Live Counter Cards Calculations using useMemo
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    let todayCount = 0;
    let totalQty = 0;
    let totalValue = 0;
    const supplierSet = new Set();

    stocks.forEach(s => {
      totalQty += 1;
      totalValue += (parseInt(s.qty || 0) * parseFloat(s.price || 0));
      if (s.supplier) supplierSet.add(s.supplier.toLowerCase().trim());
      if (s.date === todayStr) {
        todayCount += 1;
      }
    });

    return {
      today: todayCount,
      total: totalQty,
      suppliers: supplierSet.size,
      value: totalValue
    };
  }, [stocks]);

  // Live Filtered Search History Row Computation
  const filteredStocks = useMemo(() => {
    return stocks.filter(s => 
      (s.product && s.product.toLowerCase().includes(searchVal.toLowerCase())) ||
      (s.supplier && s.supplier.toLowerCase().includes(searchVal.toLowerCase()))
    );
  }, [stocks, searchVal]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      {/* 4 DYNAMIC CARDS CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Stock In */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-cart-plus text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Today's Stock In</h1>
              <h2 className="text-3xl font-semibold">{metrics.today}</h2>
            </div>
          </div>
        </div>
        
        {/* Total Stock Added */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-boxes-stacked text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Total Stock Added</h1>
              <h2 className="text-3xl font-semibold">{metrics.total}</h2>
            </div>
          </div>
        </div>
        
        {/* Suppliers Counter */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-truck-fast text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Suppliers</h1>
              <h2 className="text-3xl font-semibold">{metrics.suppliers}</h2>
            </div>
          </div>
        </div>
        
        {/* Total Value */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5 rounded shadow hover:-translate-y-2 transition">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border border-white/40 rounded-lg flex items-center justify-center">
              <i className="fa-solid fa-money-bill-wave text-4xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold">Total Value</h1>
              <h2 className="text-3xl font-semibold">Rs. {metrics.value.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* CORE TRANSACTION DATA MATRIX */}
      <div className="mt-5 bg-white border-t-4 border-green-600 p-5 shadow rounded">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Stock In History</h2>
          <button 
            onClick={openModal}
            className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 transition"
          >
            + Add Stock
          </button>
        </div>

        <input 
          id="search"
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="border p-2 rounded mb-4 focus:outline-none focus:border-green-600 text-sm w-full sm:w-64"
          placeholder="Search Product or Supplier..."
        />

        <div className="overflow-x-auto">
          <table className="w-full border min-w-[700px] text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
              <tr>
                <th className="p-3 border text-center">ID</th>
                <th className="p-3 border">Product</th>
                <th className="p-3 border">Supplier</th>
                <th className="p-3 border text-center">Qty</th>
                <th className="p-3 border">Price</th>
                <th className="p-3 border">Total Cost</th>
                <th className="p-3 border text-center">Date</th>
                <th className="p-3 border text-center">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredStocks.map((stock, index) => (
                <tr key={stock.id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-3 border text-center">{index + 1}</td>
                  <td className="p-3 border font-medium text-gray-900">{stock.product}</td>
                  <td className="p-3 border">{stock.supplier}</td>
                  <td className="p-3 border text-center font-semibold">{stock.qty}</td>
                  <td className="p-3 border">Rs. {parseFloat(stock.price || 0).toLocaleString()}</td>
                  <td className="p-3 border font-semibold text-green-700">Rs. {(parseInt(stock.qty || 0) * parseFloat(stock.price || 0)).toLocaleString()}</td>
                  <td className="p-3 border text-center">{stock.date}</td>
                  <td className="p-3 border text-center">
                    <span className="px-2.5 py-1 rounded bg-green-600 text-white text-xs font-semibold">
                      {stock.status || "Received"}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <button 
                      onClick={() => deleteStock(stock.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs"
                    >
                      <i className="fa-solid fa-trash mr-1"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStocks.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center p-5 text-gray-400 bg-gray-50 font-medium">
                    No stock transaction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK IN ENTRY FORM MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add Stock</h2>
            
            <div className="space-y-3">
              <input id="product" value={formData.product} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Product Name" />
              <input id="supplier" value={formData.supplier} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Supplier" />
              <input id="category" value={formData.category} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Category" />
              <input id="qty" type="number" value={formData.qty} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Quantity" />
              <input id="price" type="number" value={formData.price} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Unit Price" />
              <input id="date" type="date" value={formData.date} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" />
              <textarea id="remarks" value={formData.remarks} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Remarks"></textarea>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={saveStock} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}