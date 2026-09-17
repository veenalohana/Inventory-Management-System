import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function LowStock() {
  // 1. Core Dataset State - Loaded dynamically from PHP
  const [products, setProducts] = useState([]);

  // 2. Control States (Search, Filter aur Modal toggles)
  const [searchVal, setSearchVal] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockQty, setRestockQty] = useState("");

  // Hook to fetch data on mount
  useEffect(() => {
    fetchLowStockData();
  }, []);

  const fetchLowStockData = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_low_stock.php`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching low stock data:", error);
    }
  };

  // 3. Dynamic Dashboard Counters using useMemo (Database Fields mapped)
  const metrics = useMemo(() => {
    let outOfStock = 0;
    let lowStock = 0;

    products.forEach(p => {
      const currentStock = parseInt(p.stock_qty);
      const minStock = parseInt(p.min_stock);

      if (currentStock === 0) {
        outOfStock++;
      } else if (currentStock <= minStock) {
        lowStock++;
      }
    });

    return {
      outOfStock,
      lowStock,
      totalItems: products.length
    };
  }, [products]);

  // 4. Open Restock Modal Handler
  const openRestockModal = (id) => {
    const p = products.find(prod => parseInt(prod.id) === parseInt(id));
    if (p) {
      setSelectedProduct(p);
      setRestockQty("");
      setIsOpen(true);
    }
  };

  // Close Modal Handler
  const closeModal = () => {
    setIsOpen(false);
    setSelectedProduct(null);
  };

  // Submit Restock Quantity Form Handler (Calls restock_product.php)
  const submitRestock = async () => {
    const addQty = parseInt(restockQty);

    if (!addQty || addQty <= 0) {
      alert("Please enter a valid restock quantity.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/restock_product.php`, {
        id: selectedProduct.id,
        quantity: addQty
      });

      if (response.data.success) {
        const updatedStock = parseInt(selectedProduct.stock_qty) + addQty;
        
        if (updatedStock >= parseInt(selectedProduct.min_stock)) {
          alert(`${selectedProduct.name} successfully restocked! Moving out of warning zone.`);
        } else {
          alert(`Stock added, but item is still below minimum level requirement.`);
        }
        
        fetchLowStockData(); // Refresh the table directly from the database
        closeModal();
      } else {
        alert("Restock error: " + response.data.message);
      }
    } catch (error) {
      console.error("Restock transmission failed:", error);
    }
  };

  // 5. Multi-Filter Computations for rows
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const productName = p.name || "";
      const categoryName = p.category_name || "Uncategorized";
      const itemId = `P-${p.id}`;

      const matchesSearch = productName.toLowerCase().includes(searchVal.toLowerCase()) || 
                            itemId.toLowerCase().includes(searchVal.toLowerCase());
      
      const matchesCategory = catFilter === "All" || categoryName === catFilter;
      
      let matchesStatus = true;
      const currentStock = parseInt(p.stock_qty);
      const minStock = parseInt(p.min_stock);

      if (statusFilter === "Out") {
        matchesStatus = currentStock === 0;
      } else if (statusFilter === "Low") {
        matchesStatus = currentStock > 0 && currentStock <= minStock;
      }

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchVal, catFilter, statusFilter]);

  // Dynamic extract for unique category names for filter mapping
  const uniqueCategories = useMemo(() => {
    const cats = products.map(p => p.category_name).filter(Boolean);
    return ["All", ...new Set(cats)];
  }, [products]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      {/* TOP ANALYTICS COUNTER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Out Of Stock Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-5 rounded shadow hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-white/30 rounded-lg flex items-center justify-center bg-white/10">
              <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
            </div>
            <div>
              <h1 className="text-sm font-bold opacity-90 uppercase">Out of Stock Items</h1>
              <h2 className="text-3xl font-extrabold">{metrics.outOfStock}</h2>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-400 text-white p-5 rounded shadow hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-white/30 rounded-lg flex items-center justify-center bg-white/10">
              <i className="fa-solid fa-boxes-packing text-3xl"></i>
            </div>
            <div>
              <h1 className="text-sm font-bold opacity-90 uppercase">Low Stock Warning</h1>
              <h2 className="text-3xl font-extrabold">{metrics.lowStock}</h2>
            </div>
          </div>
        </div>

        {/* Total Monitored Items Card */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-5 rounded shadow hover:-translate-y-1 transition">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border border-white/30 rounded-lg flex items-center justify-center bg-white/10">
              <i className="fa-solid fa-list-check text-3xl"></i>
            </div>
            <div>
              <h1 className="text-sm font-bold opacity-90 uppercase">Total Items Monitored</h1>
              <h2 className="text-3xl font-extrabold">{metrics.totalItems}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* CORE LOGISTICS MATRIX CARD */}
      <div className="bg-white border-t-4 border-green-600 p-5 shadow rounded">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800">Critical Stock Alerts</h2>
          <p className="text-xs text-gray-500">Products currently below safety stock levels threshold parameters.</p>
        </div>

        {/* CONTROL FILTER PANELS */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <div className="flex flex-wrap gap-2">
            <select 
              value={catFilter} 
              onChange={(e) => setCatFilter(e.target.value)}
              className="border p-2 text-xs rounded bg-gray-50 focus:outline-none focus:border-green-600 font-medium text-gray-700 bg-white"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 text-xs rounded bg-gray-50 focus:outline-none focus:border-green-600 font-medium text-gray-700 bg-white"
            >
              <option value="All">All Critical Status</option>
              <option value="Out">Out of Stock (0)</option>
              <option value="Low">Low Stock Warning</option>
            </select>
          </div>

          <input 
            type="text" 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 text-xs rounded w-full sm:w-64 focus:outline-none focus:border-green-600"
            placeholder="Search by ID or Product Name..."
          />
        </div>

        {/* RESPONSIVE DATA MATRIX TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b">
              <tr>
                <th className="p-4 border text-center w-24">Item ID</th>
                <th className="p-4 border">Product Name</th>
                <th className="p-4 border">Category</th>
                <th className="p-4 border text-center">Current Stock</th>
                <th className="p-4 border text-center">Minimum Stock</th>
                <th className="p-4 border">Supplier</th>
                <th className="p-4 border text-center w-36">Status</th>
                <th className="p-4 border text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 divide-y">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 border text-center font-semibold text-gray-900">P-{p.id}</td>
                  <td className="p-4 border font-medium text-gray-900">{p.name}</td>
                  <td className="p-4 border">{p.category_name || "Uncategorized"}</td>
                  <td className="p-4 border text-center font-bold text-red-600 bg-red-50/20">{p.stock_qty}</td>
                  <td className="p-4 border text-center font-semibold">{p.min_stock}</td>
                  <td className="p-4 border">{p.supplier_name || "General Supplier"}</td>
                  <td className="p-4 border text-center">
                    <span className={`px-2.5 py-1 rounded text-xs font-bold text-white shadow-sm ${
                      parseInt(p.stock_qty) === 0 ? 'bg-red-600' : 'bg-amber-500'
                    }`}>
                      {parseInt(p.stock_qty) === 0 ? 'Out of Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="p-4 border text-center">
                    <button 
                      onClick={() => openRestockModal(p.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition flex items-center gap-1 mx-auto"
                    >
                      <i className="fa-solid fa-rotate"></i> Restock
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-5 text-gray-400 bg-gray-50 font-medium">
                    No critical low stock alerts found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK RESTOCK INVENTORY MODAL */}
      {isOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[400px] rounded-lg shadow-xl p-6 relative animate-fadeIn">
            <h2 className="text-lg font-bold mb-1 text-gray-800">Quick Restock Inventory</h2>
            <p className="text-xs text-gray-500 mb-4 font-medium bg-gray-50 p-2 rounded border border-gray-100">
              {selectedProduct.name} <br />
              <span className="text-red-500 font-bold">(Current: {selectedProduct.stock_qty}</span> / Min Required: {selectedProduct.min_stock})
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Quantity to Order / Add</label>
                <input 
                  type="number" 
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="e.g. 50" 
                  className="border p-2 w-full text-sm rounded bg-gray-50 focus:outline-none focus:border-green-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-3 border-t">
              <button 
                onClick={closeModal} 
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={submitRestock} 
                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 transition shadow"
              >
                Submit Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}