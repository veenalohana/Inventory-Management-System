import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Suppliers() {
  // 1. Core Dataset State Linked to Database Logs
  const [suppliers, setSuppliers] = useState([]);

  // 2. Control States (Modal Toggle, Search, and Filters)
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");

  // 3. Form Input States (Initial Structure)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    status: "Active",
    date: new Date().toISOString().split('T')[0] // Default today's date
  });

  // Load suppliers dynamically on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_suppliers.php`);
      if (Array.isArray(response.data)) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Transmission fault loading suppliers:", error);
    }
  };

  // Handle Input Field Changes
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Open Modal Toggler (Add / Edit Router Mode)
  const openModal = (id = null) => {
    if (id !== null) {
      // Edit Mode
      const s = suppliers.find(x => x.id === id);
      if (s) {
        setEditId(id);
        setFormData({
          name: s.name,
          company: s.company,
          contact: s.contact || "",
          phone: s.phone,
          email: s.email || "",
          address: s.address || "",
          city: s.city,
          status: s.status,
          date: s.date
        });
      }
    } else {
      // Add Mode
      setEditId(null);
      setFormData({
        name: "",
        company: "",
        contact: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        status: "Active",
        date: new Date().toISOString().split('T')[0]
      });
    }
    setIsOpen(true);
  };

  // Close Modal Handler
  const closeModal = () => {
    setIsOpen(false);
    setEditId(null);
  };

  // Save / Update Supplier Record Logic (Database Connected)
  const saveSupplier = async () => {
    const { name, company, contact, phone, email, address, city, status, date } = formData;

    // Direct Validation Check as per JS File
    if (!name || !company || !phone || !city || !status) {
      alert("Please fill required fields");
      return;
    }
    // 2. Phone Number Validation (Regex: Only numbers, 10 to 11 digits allowed)
  const phoneRegex = /^[0-9]{11}$/;
  if (!phoneRegex.test(phone)) {
    alert("Invalid Phone Number! Please enter a valid  11 digit mobile number.");
    return;
  }

  // 3. Email Validation (If email is provided)
  if (email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Invalid Email Format! Please enter a valid email address (e.g., ali@gmail.com).");
      return;}}

    try {
      const payload = {
        name,
        company,
        contact,
        phone,
        email,
        address,
        city,
        status,
        date
      };

      // Agar EditId active hai, toh payload mein send karenge taake edit trigger ho sake
      if (editId !== null) {
        payload.id = editId;
      }

      const response = await axios.post(`${API_URL}/save_supplier.php`, payload);

      if (response.data.success) {
        alert(response.data.message);
        fetchSuppliers(); // Real-time tables update karne ke liye
        closeModal();
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Failure synchronizing record:", error);
      alert("Backend framework engine communication crash.");
    }
  };

  // Delete Supplier Action Handler (Database Connected)
  const deleteSupplier = async (id) => {
    if (window.confirm("Delete Supplier?")) {
      try {
        const response = await axios.post(`${API_URL}/delete_supplier.php`, { id });
        if (response.data.success) {
          alert("Supplier record deleted successfully.");
          fetchSuppliers();
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Deletion API execution collapse:", error);
      }
    }
  };

  // View Supplier Details Alert Logic
  const viewSupplier = (id) => {
    const s = suppliers.find(x => x.id === id);
    if (s) {
      alert(
        "Supplier Name: " + s.name +
        "\nCompany: " + s.company +
        "\nContact Person: " + (s.contact || '-') +
        "\nPhone: " + s.phone +
        "\nEmail: " + (s.email || '-') +
        "\nCity: " + s.city +
        "\nStatus: " + s.status +
        "\nDate: " + s.date
      );
    }
  };

  // Dynamic Multi-Filter live list computation using useMemo
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = 
        (s.name && s.name.toLowerCase().includes(searchVal.toLowerCase())) || 
        (s.company && s.company.toLowerCase().includes(searchVal.toLowerCase()));
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      const matchesCity = cityFilter === "All" || s.city === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [suppliers, searchVal, statusFilter, cityFilter]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      <div className="bg-white border-t-4 border-green-600 p-5 shadow rounded">
        
        {/* Header Module Row */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800">Suppliers Management</h2>
          <button 
            onClick={() => openModal()}
            className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 transition"
          >
            + Add Supplier
          </button>
        </div>

        {/* Filters Matrix Controls */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <div className="flex gap-2">
            <select 
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm bg-white"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select 
              id="cityFilter"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm bg-white"
            >
              <option value="All">All Cities</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Karachi">Karachi</option>
              <option value="Lahore">Lahore</option>
              <option value="Islamabad">Islamabad</option>
            </select>
          </div>

          <input 
            id="search"
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm w-full sm:w-64"
            placeholder="Search Name or Company..."
          />
        </div>

        {/* Suppliers Core Responsive Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[800px] text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="p-3 border text-center w-16">ID</th>
                <th className="p-3 border">Supplier Name</th>
                <th className="p-3 border">Company</th>
                <th className="p-3 border">Contact Person</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">City</th>
                <th className="p-3 border text-center w-28">Status</th>
                <th className="p-3 border text-center w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredSuppliers.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 border-b transition">
                  <td className="p-3 border text-center font-semibold">{s.id}</td>
                  <td className="p-3 border font-medium text-gray-900">{s.name}</td>
                  <td className="p-3 border">{s.company}</td>
                  <td className="p-3 border">{s.contact || '-'}</td>
                  <td className="p-3 border">{s.phone}</td>
                  <td className="p-3 border">{s.city}</td>
                  <td className="p-3 border text-center">
                    <span className={`px-2.5 py-1 rounded text-white text-xs font-semibold ${
                      s.status === "Active" ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 border text-center space-x-1.5">
                    <button 
                      onClick={() => viewSupplier(s.id)}
                      className="bg-amber-500 text-white px-2.5 py-1 rounded hover:bg-amber-600 transition text-xs"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => openModal(s.id)}
                      className="bg-blue-500 text-white px-2.5 py-1 rounded hover:bg-blue-600 transition text-xs"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteSupplier(s.id)}
                      className="bg-red-500 text-white px-2.5 py-1 rounded hover:bg-red-600 transition text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center p-5 text-gray-400 bg-gray-50 font-medium">
                    No suppliers records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUPPLIER SUBMISSION MODAL POPUP DIALOG */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 max-h-[90vh] overflow-y-auto transform transition-all animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editId ? "Edit Supplier" : "Add Supplier"}
            </h2>
            
            <div className="space-y-3">
              <input id="name" value={formData.name} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Supplier Name" />
              <input id="company" value={formData.company} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Company Name" />
              <input id="contact" value={formData.contact} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Contact Person" />
              <input id="phone" value={formData.phone} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Phone Number" />
              <input id="email" type="email" value={formData.email} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Email Address" />
              <textarea id="address" value={formData.address} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" placeholder="Address"></textarea>
              
              <select id="city" value={formData.city} onChange={handleInputChange} className="border p-2 w-full rounded text-sm bg-white focus:border-green-600 focus:outline-none">
                <option value="">Select City</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Karachi">Karachi</option>
                <option value="Lahore">Lahore</option>
                <option value="Islamabad">Islamabad</option>
              </select>

              <select id="status" value={formData.status} onChange={handleInputChange} className="border p-2 w-full rounded text-sm bg-white focus:border-green-600 focus:outline-none">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <input id="date" type="date" value={formData.date} onChange={handleInputChange} className="border p-2 w-full rounded text-sm focus:border-green-600 focus:outline-none" />
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <button onClick={closeModal} className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition">
                Cancel
              </button>
              <button onClick={saveSupplier} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}