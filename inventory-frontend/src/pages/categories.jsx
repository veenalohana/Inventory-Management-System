import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Categories() {
  // 1. Initial State starts empty now (Data will come from MySQL)
  const [categories, setCategories] = useState([]);

  // 2. States for Modal, Search, Filter, and Edit Tracking
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // 3. Form Input States & Validation Error Message State
  const [catName, setCatName] = useState("");
  const [catStatus, setCatStatus] = useState("Active");
  const [errorMsg, setErrorMsg] = useState("");

  // API 1: Fetch Data on Page Load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_categories.php`);
      setCategories(response.data);
    } catch (error) {
      console.error("Database se data load karne me dikkat hui:", error);
    }
  };

  // Open Modal Handler
  const openModal = (id = null) => {
    setErrorMsg("");
    if (id !== null && id !== undefined) {
      // Edit Mode - Find category object
      const category = categories.find(c => intvalCheck(c.id) === intvalCheck(id));
      if (category) {
        setEditId(id);
        setCatName(category.name);
        setCatStatus(category.status);
      }
    } else {
      // Add Mode
      setEditId(null);
      setCatName("");
      setCatStatus("Active");
    }
    setIsOpen(true);
  };

  // Helper utility to safely manage numeric comparison across types
  const intvalCheck = (val) => parseInt(val, 10);

  // Close Modal Handler
  const closeModal = () => {
    setIsOpen(false);
    setEditId(null);
    setErrorMsg("");
  };

  // Save Category Logic (Connects to add_category.php and update_category.php)
  const saveCategory = async () => {
    const trimmedName = catName.trim();

    // Required Field Validation
    if (trimmedName === "") {
      setErrorMsg("Category name is required");
      return;
    }

    // Duplicate Check Validation
    const isDuplicate = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase() && intvalCheck(c.id) !== intvalCheck(editId)
    );

    if (isDuplicate) {
      setErrorMsg("Category already exists");
      return;
    }

    try {
      if (editId !== null) {
        // Edit Mode Update (Hit PHP API)
        const response = await axios.post(`${API_URL}/update_category.php`, {
          id: editId,
          name: trimmedName,
          status: catStatus
        });
        if (response.data.success) fetchCategories();
      } else {
        // Add New Category Mode (Hit PHP API)
        const response = await axios.post(`${API_URL}/add_category.php`, {
          name: trimmedName,
          status: catStatus
        });
        if (response.data.success) fetchCategories();
      }
      closeModal();
    } catch (error) {
      console.error("Data save karne me error aaya:", error);
    }
  };

  // Delete Category Handler (Connects to delete_category.php)
  const deleteCategory = async (id) => {
    if (window.confirm("Delete this category?")) {
      try {
        const response = await axios.get(`${API_URL}/delete_category.php?id=${id}`);
        if (response.data.success) {
          fetchCategories(); // Reload table dynamic rows automatically
        }
      } catch (error) {
        console.error("Delete call request failure:", error);
      }
    }
  };

  // Combined Live Search and Status Filtering with useMemo
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchVal.toLowerCase());
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchVal, statusFilter]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      <div className="bg-white border-t-4 border-green-600 p-5 shadow">
        
        {/* Header Title Section */}
        <div className="flex justify-between mb-5 items-center">
          <h2 className="text-xl font-bold text-gray-800">
            Category Management
          </h2>
          <button 
            onClick={() => openModal()}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition font-medium"
          >
            + Add Category
          </button>
        </div>
        
        {/* Filters and Inputs Row */}
        <div className="flex justify-between mb-4 gap-4">
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
          
          <input 
            id="search"
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm w-full sm:w-64"
            placeholder="Search Category"
          />
        </div>
        
        {/* Data Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[700px] text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="border p-3 text-center w-24">ID</th>
                <th className="border p-3">Category Name</th>
                <th className="border p-3 text-center w-36">Status</th>
                <th className="border p-3 text-center w-48">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredCategories.map((category, index) => (
                <tr key={category.id} className="hover:bg-gray-50 transition border-b">
                  <td className="border p-3 text-center">{index + 1}</td>
                  <td className="border p-3 font-medium text-gray-900">{category.name}</td>
                  <td className="border p-3 text-center">
                    <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                      category.status === "Active" ? 'bg-green-600' : 'bg-red-500'
                    }`}>
                      {category.status}
                    </span>
                  </td>
                  <td className="border p-3 text-center space-x-2">
                    <button 
                      onClick={() => openModal(category.id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-xs"
                    >
                      <i className="fa-solid fa-pen mr-1"></i> Edit
                    </button>
                    <button 
                      onClick={() => deleteCategory(category.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs"
                    >
                      <i className="fa-solid fa-trash mr-1"></i> Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-5 text-gray-400 font-medium bg-gray-50">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Entry Popup Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 overflow-hidden transform transition-all">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {editId ? "Edit Category" : "Category Form"}
            </h2>
            
            <input 
              id="categoryName"
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="border p-2 w-full mb-3 rounded focus:outline-none focus:border-green-600 text-sm"
              placeholder="Category Name"
            />
            
            <select 
              id="categoryStatus"
              value={catStatus}
              onChange={(e) => setCatStatus(e.target.value)}
              className="border p-2 w-full mb-3 rounded focus:outline-none focus:border-green-600 text-sm bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Error Message Tag Container */}
            {errorMsg && (
              <p className="text-red-500 text-xs font-semibold mb-2">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
              <button 
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveCategory}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}