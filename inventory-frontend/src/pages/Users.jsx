import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Backend folder ki URL
const API_URL = "http://localhost:8080/inventory-api";

export default function Users() {
  // 1. Core States for Dynamic Users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Control States (Modal, Errors, Search, Filters)
  const [isOpen, setIsOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [error, setError] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // 3. Form Input States
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    status: "Active"
  });

  // Screen load hote hi users fetch karna
  useEffect(() => {
    fetchUsers();
  }, []);

  // API se Users List Load karne ka function
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/get_users.php`);
      // Agar data array hai toh save karein, warna empty array rakhein safely
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Users fetch karne mein error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  // Open Modal Helper
  const openModal = (index = null) => {
    setError("");
    if (index !== null) {
      setEditIndex(index);
      setFormData(filteredUsers[index]); // Filtered array se profile load karenge
    } else {
      setEditIndex(null);
      setFormData({
        id: null,
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "",
        status: "Active"
      });
    }
    setIsOpen(true);
  };

  // Close Modal Helper
  const closeModal = () => {
    setIsOpen(false);
    setError("");
  };

  // SAVE OR UPDATE USER
  const saveUser = async () => {
    const { name, email, phone, password, role, status } = formData;
    const n = name.trim();
    const e = email.trim();
    const p = phone.trim();

    // EMPTY CHECK
    if (n === "" || e === "" || p === "" || password === "" || role === "") {
      setError("❌ All fields are required");
      return;
    }

    // EMAIL VALIDATION
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(e)) {
      setError("❌ Invalid email format");
      return;
    }

    // PASSWORD VALIDATION
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!strongPassword.test(password)) {
      setError("❌ Password must be 8+ chars, uppercase, lowercase, number, special char");
      return;
    }

    // DUPLICATE EMAIL CHECK (Client side basic check)
    const emailExists = users.some((u) => u.email === e && u.id !== formData.id);
    if (emailExists) {
      setError("❌ Email already exists");
      return;
    }

    try {
      let response;
      if (editIndex !== null) {
        // Update Mode
        response = await axios.post(`${API_URL}/update_user.php`, {
          id: formData.id,
          name: n,
          email: e,
          phone: p,
          password: password,
          role: role,
          status: status
        });
      } else {
        // Create Mode
        response = await axios.post(`${API_URL}/add_user.php`, {
          name: n,
          email: e,
          phone: p,
          password: password,
          role: role,
          status: status
        });
      }

      // Refresh table metrics
      fetchUsers();
      closeModal();
    } catch (err) {
      console.error("Save transaction error:", err);
      setError("❌ Server API connect karne mein error aaya!");
    }
  };

  // DELETE USER (Using Database ID reference)
  const deleteUser = async (index) => {
    const targetUser = filteredUsers[index];
    if (window.confirm(`Kya aap sach mein user "${targetUser.name}" ko delete karna chahte hain?`)) {
      try {
        await axios.get(`${API_URL}/delete_user.php?id=${targetUser.id}`);
        fetchUsers(); // Live refresh execution
      } catch (err) {
        console.error("User deletion error:", err);
        alert("❌ Server connection error!");
      }
    }
  };

  // VIEW USER DETAILS
  const viewUser = (index) => {
    const u = filteredUsers[index];
    alert(`👤 USER PROFILE DETAILS:\n\nName: ${u.name}\nEmail: ${u.email}\nPhone: ${u.phone}\nRole: ${u.role}\nStatus: ${u.status}\nJoined: ${u.date || "N/A"}`);
  };

  // FILTER & SEARCH LOGIC
  const filteredUsers = users.filter((u) => {
    const nameVal = u.name ? u.name.toLowerCase() : "";
    const emailVal = u.email ? u.email.toLowerCase() : "";
    const phoneVal = u.phone ? u.phone : "";

    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesSearch =
      nameVal.includes(searchVal.toLowerCase()) ||
      emailVal.includes(searchVal.toLowerCase()) ||
      phoneVal.includes(searchVal);
    return matchesRole && matchesSearch;
  });

  return (
    <div className="md:ml-0 pt-4 px-1">
      <div className="bg-white border-t-4 border-green-600 p-5 shadow">
        
        {/* Header Section */}
        <div className="flex justify-between mb-5">
          <h2 className="text-xl font-bold">System Users</h2>
          <button 
            onClick={() => openModal()}
            className="bg-green-600 text-white px-5 py-2 rounded font-semibold hover:bg-green-700 transition"
          >
            + Add New User
          </button>
        </div>

        {/* Filters Section */}
        <div className="flex justify-between mb-4">
          <select 
            id="roleFilter" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600 bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Inventory Staff">Inventory Staff</option>
            <option value="Sales Staff">Sales Staff</option>
          </select>
          
          <input 
            id="search" 
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600"   
            placeholder="Search User by Name/Email/Phone"
          />
        </div>

        {/* Loader Status */}
        {loading ? (
          <div className="text-center py-10 font-semibold text-green-600">
            ⏳ Database se users fetch ho rahe hain, please wait...
          </div>
        ) : (
          /* Responsive Table */
          <div className="overflow-x-auto">
            <table className="w-full border min-w-[900px] text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border p-3">ID</th>
                  <th className="border p-3 text-center">Image</th>
                  <th className="border p-3">Name</th>
                  <th className="border p-3">Email</th>
                  <th className="border p-3">Phone</th>
                  <th className="border p-3">Role</th>
                  <th className="border p-3">Status</th>
                  <th className="border p-3">Date</th>
                  <th className="border p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-gray-50 border-b">
                    <td className="border p-3">U-{u.id}</td>
                    <td className="border p-3 text-center">
                      <img 
                        src={u.img || "https://i.pravatar.cc/50"} 
                        alt={u.name} 
                        className="w-12 h-12 rounded-full mx-auto object-cover border" 
                        onError={(e) => { e.target.src = "https://i.pravatar.cc/50"; }}
                      />
                    </td>
                    <td className="border p-3 font-semibold">{u.name}</td>
                    <td className="border p-3">{u.email}</td>
                    <td className="border p-3">{u.phone}</td>
                    <td className="border p-3">{u.role}</td>
                    <td className="border p-3">
                      <span className={`px-3 py-1 rounded text-white text-xs font-semibold ${u.status === "Active" ? "bg-green-600" : "bg-red-600"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="border p-3">{u.date || "N/A"}</td>
                    <td className="border p-3 space-x-1">
                      <button onClick={() => viewUser(index)} className="bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 transition" title="View details">
                        <i className="fa fa-eye"></i>
                      </button>
                      <button onClick={() => openModal(index)} className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition" title="Edit Profile">
                        <i className="fa fa-pen"></i>
                      </button>
                      <button onClick={() => deleteUser(index)} className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition" title="Delete User">
                        <i className="fa fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center p-5 text-gray-500 font-medium">No users found matching the criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL DIALOG ────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow-xl w-96 animate-fadeIn">
            <h2 className="text-xl font-bold mb-3">
              {editIndex !== null ? "Edit User Profile" : "Create User Profile"}
            </h2>

            <input 
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600"
              placeholder="Full Name"
            />
            
            <input 
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600"
              placeholder="Email"
            />
            
            <input 
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600"
              placeholder="Phone Number (e.g. 03001234567)"
            />
            
            <input 
              id="password"
              type="text"
              value={formData.password}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600"
              placeholder="Password"
            />
            
            <select 
              id="role"
              value={formData.role}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600 bg-white"
            >
              <option value="">Select Role</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Inventory Staff">Inventory Staff</option>
              <option value="Sales Staff">Sales Staff</option>
            </select>
            
            <select 
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2 rounded focus:outline-none focus:border-green-600 bg-white"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            
            {error && <p id="error" className="text-red-500 text-sm mb-2">{error}</p>}
            
            <div className="flex justify-end gap-2 mt-3">
              <button 
                onClick={closeModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveUser}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
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