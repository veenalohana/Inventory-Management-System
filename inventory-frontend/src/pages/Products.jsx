import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

const API_URL = "http://localhost:8080/inventory-api";

export default function Products() {
  // 1. Database Entities States
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]); // Dynamic dropdown list database se fetch hogi

  // 2. Control Layout Parameters
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchVal, setSearchVal] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Category");

  // 3. Form States Architecture
  const [formData, setFormData] = useState({
    name: "",
    category_id: "", // String standard dynamic match validation mapping rule
    price: "",
    stock_qty: "",
    min_stock: "10",
    supplier_name: "General Supplier"
  });

  // Load products and dynamic category entries on screen initialization
  useEffect(() => {
    fetchProducts();
    fetchDropdownCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_products.php`);
      setProducts(response.data);
    } catch (error) {
      console.error("Products load karne me error aaya:", error);
    }
  };

  const fetchDropdownCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/get_categories.php`);
      setDbCategories(response.data);
    } catch (error) {
      console.error("Categories dropdown data loading failed:", error);
    }
  };

  // Handle Input Updates
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Open Dialog Box
  const openModal = (id = null) => {
    if (id !== null) {
      const product = products.find(p => parseInt(p.id) === parseInt(id));
      if (product) {
        setEditId(id);
        setFormData({
          name: product.name,
          category_id: product.category_id,
          price: product.price,
          stock_qty: product.stock_qty,
          min_stock: product.min_stock || "10",
          supplier_name: product.supplier_name || "General Supplier"
        });
      }
    } else {
      setEditId(null);
      setFormData({
        name: "",
        category_id: dbCategories[0]?.id || "", // Default select standard setting index rule
        price: "",
        stock_qty: "",
        min_stock: "10",
        supplier_name: "General Supplier"
      });
    }
    setIsOpen(true);
  };

  // Close Dialog Box
  const closeModal = () => {
    setIsOpen(false);
    setEditId(null);
  };

  // Save Transaction (Calls add_product.php or update_product.php)
  const saveProduct = async () => {
    const { name, category_id, price, stock_qty, min_stock, supplier_name } = formData;

    if (name === "" || price === "" || stock_qty === "" || category_id === "") {
      alert("Please populate all requested dynamic entity fields");
      return;
    }

    const dataPayload = {
      name,
      category_id: parseInt(category_id),
      price: parseFloat(price),
      stock_qty: parseInt(stock_qty),
      min_stock: parseInt(min_stock),
      supplier_name
    };

    try {
      if (editId) {
        // Update Module API call
        const res = await axios.post(`${API_URL}/update_product.php`, {
          id: editId,
          ...dataPayload
        });
        if (res.data.success) fetchProducts();
      } else {
        // Create Module API call
        const res = await axios.post(`${API_URL}/add_product.php`, dataPayload);
        if (res.data.success) fetchProducts();
      }
      closeModal();
    } catch (error) {
      console.error("Database process tracking failed:", error);
    }
  };

  // Delete Action Handler
  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product record?")) {
      try {
        const res = await axios.get(`${API_URL}/delete_product.php?id=${id}`);
        if (res.data.success) fetchProducts();
      } catch (error) {
        console.error("Deletion execution transmission error:", error);
      }
    }
  };

  // Inline dynamic notification viewer
  const viewProduct = (id) => {
    const p = products.find(x => parseInt(x.id) === parseInt(id));
    if (p) {
      alert(
        `Product Ledger Trace: \n\nName: ${p.name}\nCategory: ${p.category_name || "Uncategorized"}\nPrice: Rs ${parseFloat(p.price).toFixed(2)}\nAvailable Quantity: ${p.stock_qty}\nMinimum Limit: ${p.min_stock}`
      );
    }
  };

  // Integrated real-time local computations loop engine
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchVal.toLowerCase());
      const matchesCategory = categoryFilter === "All Category" || p.category_name === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchVal, categoryFilter]);

  return (
    <div className="md:ml-0 pt-4 px-1">
      <div className="bg-white border-t-4 border-green-600 shadow p-5">
        
        {/* Header Action Row */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-bold text-gray-800">Product Listing</h1>
          <button 
            onClick={() => openModal()} 
            className="bg-green-600 text-white px-5 py-2 rounded font-medium hover:bg-green-700 transition"
          >
            + Add Product
          </button>
        </div>
        
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between mb-5 gap-4">
          <select 
            id="filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm bg-white"
          >
            <option value="All Category">All Category</option>
            {dbCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          
          <input 
            id="search"
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:border-green-600 text-sm w-full sm:w-64"
            placeholder="Search Product..."
          />
        </div>
        
        {/* Inventory Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border min-w-[700px] text-left text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 font-semibold border-b">
              <tr>
                <th className="border p-3 text-center w-24">Item Code</th>
                <th className="border p-3">Name</th>
                <th className="border p-3">Category</th>
                <th className="border p-3">Price</th>
                <th className="border p-3">Qty</th>
                <th className="border p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition border-b">
                  <td className="border p-3 text-center font-bold text-gray-900">P-{product.id}</td>
                  <td className="border p-3 font-medium text-gray-900">{product.name}</td>
                  <td className="border p-3">{product.category_name || "Uncategorized"}</td>
                  <td className="border p-3 font-semibold">Rs {parseFloat(product.price).toFixed(2)}</td>
                  <td className={`border p-3 font-bold ${parseInt(product.stock_qty) <= parseInt(product.min_stock) ? 'text-red-500' : 'text-gray-700'}`}>
                    {product.stock_qty}
                  </td>
                  <td className="border p-3 text-center space-x-1.5">
                    <button 
                      onClick={() => viewProduct(product.id)}
                      className="bg-blue-500 text-white px-3 py-1.5 rounded hover:bg-blue-600 transition text-xs"
                      title="View Details"
                    >
                      <i className="fa fa-eye"></i>
                    </button>
                    <button 
                      onClick={() => openModal(product.id)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition text-xs"
                      title="Edit Product"
                    >
                      <i className="fa fa-edit"></i>
                    </button>
                    <button 
                      onClick={() => deleteProduct(product.id)}
                      className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition text-xs"
                      title="Delete Product"
                    >
                      <i className="fa fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center p-5 text-gray-400 font-medium bg-gray-50">
                    No products found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Entry Form Dialog Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-96 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
            
            <div className="bg-green-600 p-4 text-white font-bold text-lg">
              {editId ? "Edit Product Details" : "Add Product Entity"}
            </div>

            <div className="p-6 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Product Name</label>
                <input 
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Product Name"
                  className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Category Mapping Link</label>
                <select 
                  id="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm bg-white font-semibold"
                >
                  {dbCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Supplier Reference</label>
                <input 
                  id="supplier_name"
                  type="text"
                  value={formData.supplier_name}
                  onChange={handleInputChange}
                  placeholder="Supplier Name"
                  className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Price (Rs)</label>
                  <input 
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Price"
                    className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Initial Quantity</label>
                  <input 
                    id="stock_qty"
                    type="number"
                    value={formData.stock_qty}
                    onChange={handleInputChange}
                    placeholder="Qty"
                    className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1 uppercase">Minimum Safety Stock Level</label>
                <input 
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  placeholder="e.g. 10"
                  className="border p-2 w-full rounded focus:outline-none focus:border-green-600 text-sm"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-3 border-t mt-4">
                <button 
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveProduct}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition"
                >
                  Save Product
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}