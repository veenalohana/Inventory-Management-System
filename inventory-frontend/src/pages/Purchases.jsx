import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [productsList, setProductsList] = useState([]); 

  const [searchVal, setSearchVal] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [currentId, setCurrentId] = useState(null);

  const [formSupplier, setFormSupplier] = useState("");
  const [formInvoice, setFormInvoice] = useState("");
  const [formProduct, setFormProduct] = useState(""); 
  const [formQuantity, setFormQuantity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formTotalAmount, setFormTotalAmount] = useState(0);
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState("Received");

  useEffect(() => {
    fetchPurchasesLedger();
    fetchProductsList(); 
  }, []);

  const fetchPurchasesLedger = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_purchases.php`);
      if (Array.isArray(response.data)) {
        setPurchases(response.data);
      }
    } catch (error) {
      console.error("Error connecting to database:", error);
    }
  };

  const fetchProductsList = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_products.php`); 
      if (Array.isArray(response.data)) {
        setProductsList(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setProductsList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    const qty = parseInt(formQuantity) || 0;
    const prc = parseFloat(formPrice) || 0;
    setFormTotalAmount(qty * prc);
  }, [formQuantity, formPrice]);

  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todayCount = 0;
    const suppliersSet = new Set();

    purchases.forEach(p => {
      if (p.supplier) suppliersSet.add(p.supplier);
      if (p.date === todayStr) todayCount++;
    });

    return {
      totalPurchases: purchases.length,
      todayPurchases: todayCount,
      totalSuppliers: suppliersSet.size
    };
  }, [purchases]);

  const uniqueSuppliers = useMemo(() => {
    return ["All", ...new Set(purchases.map(p => p.supplier).filter(Boolean))];
  }, [purchases]);

  const openCreateModal = () => {
    setModalMode("create");
    setCurrentId(null);
    setFormSupplier("");
    setFormInvoice("");
    setFormProduct(""); 
    setFormQuantity("");
    setFormPrice("");
    setFormTotalAmount(0);
    setFormDate(new Date().toISOString().split('T')[0]); 
    setFormStatus("Received");
    setIsOpen(true);
  };

  const openModal = (id, mode) => {
    const p = purchases.find(item => item.id === id);
    if (p) {
      setModalMode(mode);
      setCurrentId(id);
      setFormSupplier(p.supplier);
      setFormInvoice(p.invoice);
      
      const foundProd = productsList.find(pr => pr.name === p.product);
      setFormProduct(foundProd ? foundProd.id : "");
      
      setFormQuantity(p.quantity.toString());
      setFormPrice(p.price.toString());
      setFormTotalAmount(p.total);
      setFormDate(p.date);
      setFormStatus(p.status || "Received");
      setIsOpen(true);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formSupplier || !formProduct || !formQuantity || !formPrice) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      if (modalMode === "edit") {
        // Edit mode payload with product_id included so backend can balance the stocks
        const response = await axios.post(`${API_URL}/update_purchase.php`, { 
          id: currentId, 
          product_id: parseInt(formProduct),
          quantity: parseInt(formQuantity),
          price: parseFloat(formPrice),
          total_amount: formTotalAmount,
          status: formStatus 
        });
        if (response.data.success) {
          alert("Purchase record updated successfully.");
          fetchPurchasesLedger();
        } else {
          alert(response.data.message);
        }
      } else {
        const response = await axios.post(`${API_URL}/place_purchase.php`, {
          supplier_name: formSupplier,
          items: [{ product_id: parseInt(formProduct), quantity: parseInt(formQuantity) || 0, price: parseFloat(formPrice) || 0 }],
          total_amount: formTotalAmount,
          status: formStatus
        });
        if (response.data.success) {
          alert("Purchase record processed successfully!");
          fetchPurchasesLedger();
        } else {
          alert(response.data.message);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
    }

    closeModal();
  };

  const deletePurchase = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete record ${id}?`)) {
      try {
        const response = await axios.post(`${API_URL}/delete_purchase.php`, { id: parseInt(id) });
        if (response.data.success) {
          alert("Record deleted successfully.");
          fetchPurchasesLedger();
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Deletion error:", error);
      }
    }
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      const pId = String(p.id || "");
      const pProduct = p.product || "";
      const pInvoice = p.invoice || "";
      const pSupplier = p.supplier || "";
      const pDate = p.date || "";

      const matchesSearch = pProduct.toLowerCase().includes(searchVal.toLowerCase()) || 
                            pInvoice.toLowerCase().includes(searchVal.toLowerCase()) ||
                            pId.toLowerCase().includes(searchVal.toLowerCase());
      const matchesSupplier = supplierFilter === "All" || pSupplier === supplierFilter;
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      const matchesDate = dateFilter === "" || pDate === dateFilter;

      return matchesSearch && matchesSupplier && matchesStatus && matchesDate;
    });
  }, [purchases, searchVal, supplierFilter, statusFilter, dateFilter]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      {/* CARDS COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-5 rounded shadow border-l-4 border-green-600 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Purchases</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.totalPurchases}</h1>
          </div>
          <div className="text-green-600 text-2xl bg-green-50 p-3 rounded-lg"><i className="fa-solid fa-file-invoice-dollar"></i></div>
        </div>
        <div className="bg-white p-5 rounded shadow border-l-4 border-amber-500 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Today's Inbound</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.todayPurchases}</h1>
          </div>
          <div className="text-amber-500 text-2xl bg-amber-50 p-3 rounded-lg"><i className="fa-solid fa-calendar-day"></i></div>
        </div>
        <div className="bg-white p-5 rounded shadow border-l-4 border-blue-500 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suppliers</h3>
            <h1 className="text-2xl font-black text-gray-800 mt-1">{metrics.totalSuppliers}</h1>
          </div>
          <div className="text-blue-500 text-2xl bg-blue-50 p-3 rounded-lg"><i className="fa-solid fa-truck-field"></i></div>
        </div>
      </div>

      {/* REGISTRY TABLE */}
      <div className="bg-white border-t-4 border-green-600 p-5 shadow rounded">
        <div className="mb-5 flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Purchases Ledger Registry</h2>
          </div>
          <button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded shadow flex items-center gap-1.5">
            <i className="fa-solid fa-plus text-sm"></i> Add New Purchase
          </button>
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5 bg-gray-50 p-3 rounded border">
          <div className="flex flex-wrap gap-2">
            <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)} className="border p-2 text-xs rounded bg-white text-gray-700 font-semibold">
              {uniqueSuppliers.map(s => <option key={s} value={s}>{s === "All" ? "All Suppliers" : s}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 text-xs rounded bg-white text-gray-700 font-semibold">
              <option value="All">All Operations Status</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
              <option value="Ordered">Ordered</option>
            </select>
            <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border p-2 text-xs rounded bg-white text-gray-700 font-medium" />
          </div>
          <input type="text" value={searchVal} onChange={(e) => setSearchVal(e.target.value)} className="border p-2 text-xs rounded bg-white w-full sm:w-64" placeholder="Search ID or Product..." />
        </div>

        {/* DATA GRID */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[850px] text-sm text-left border-collapse">
            <thead className="bg-gray-100 font-bold text-gray-700 border-b text-center">
              <tr>
                <th className="p-3 border w-24">ID</th>
                <th className="border text-left pl-4">Product Element</th>
                <th className="border text-left pl-4">Supplier</th>
                <th className="border w-20">Qty</th>
                <th className="border w-28">Unit Price</th>
                <th className="border w-32">Total Cost</th>
                <th className="border w-32">Log Date</th>
                <th className="border w-32">Status</th>
                <th className="border w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-center text-gray-600">
              {filteredPurchases.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition">
                  <td className="p-3 border font-semibold text-gray-900">PUR-{item.id}</td>
                  <td className="border text-left pl-4 font-medium text-gray-900">{item.product}</td>
                  <td className="border text-left pl-4 font-medium text-gray-500">{item.supplier}</td>
                  <td className="border font-semibold">{item.quantity}</td>
                  <td className="border">Rs {parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="border font-bold text-gray-800">Rs {parseFloat(item.total || 0).toFixed(2)}</td>
                  <td className="border text-xs font-semibold">{item.date}</td>
                  <td className="border">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      item.status === "Received" ? 'bg-green-100 text-green-700' :
                      item.status === "Pending" ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status || "Received"}
                    </span>
                  </td>
                  <td className="border space-x-1">
                    <button type="button" onClick={() => openModal(item.id, 'view')} className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-sm"><i className="fa-solid fa-eye"></i></button>
                    <button type="button" onClick={() => openModal(item.id, 'edit')} className="bg-amber-500 text-white text-xs px-2 py-1 rounded shadow-sm"><i className="fa-solid fa-pen"></i></button>
                    <button type="button" onClick={() => deletePurchase(item.id)} className="bg-red-500 text-white text-xs px-2 py-1 rounded shadow-sm"><i className="fa-solid fa-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG POPUP MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto transform transition-all">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {modalMode === 'create' ? "Add Purchase Record" : modalMode === 'view' ? "Inbound Purchase Details" : "Modify Purchase Matrix"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Supplier Name</label>
                <input 
                  type="text" value={formSupplier} onChange={(e) => setFormSupplier(e.target.value)}
                  disabled={modalMode === 'view' || modalMode === 'edit'} placeholder="e.g. Apex Logistics"
                  className="border p-2 w-full text-sm rounded bg-white disabled:bg-gray-100" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Product Element</label>
                <select
                  value={formProduct} onChange={(e) => setFormProduct(e.target.value)}
                  disabled={modalMode === 'view' || modalMode === 'edit'}
                  className="border p-2 w-full text-sm rounded bg-white disabled:bg-gray-100"
                >
                  <option value="">Select a Product</option>
                  {productsList.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Quantity</label>
                  <input 
                    type="number" value={formQuantity} onChange={(e) => setFormQuantity(e.target.value)}
                    disabled={modalMode === 'view'} placeholder="50"
                    className="border p-2 w-full text-sm rounded bg-white disabled:bg-gray-100" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Unit Price (Rs)</label>
                  <input 
                    type="number" step="0.01" value={formPrice} onChange={(e) => setFormPrice(e.target.value)}
                    disabled={modalMode === 'view'} placeholder="15"
                    className="border p-2 w-full text-sm rounded bg-white disabled:bg-gray-100" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Calculated Total Amount (Rs)</label>
                <input type="number" value={formTotalAmount} readOnly className="border p-2 w-full text-sm rounded bg-gray-100 font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Operations Status</label>
                <select 
                  value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                  disabled={modalMode === 'view'}
                  className="border p-2 w-full text-sm rounded bg-white"
                >
                  <option value="Received">Received</option>
                  <option value="Pending">Pending</option>
                  <option value="Ordered">Ordered</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-3 border-t">
                <button type="button" onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium">Close</button>
                {modalMode !== 'view' && (
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold shadow">
                    {modalMode === 'create' ? "Submit Purchase" : "Save Changes"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}