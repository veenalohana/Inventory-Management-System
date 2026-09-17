import React from 'react';
import { NavLink } from 'react-router-dom';

function Layout({ children }) {
  // Navigation links array for clean rendering and active state evaluation
  const navItems = [
    { to: "/", label: "Dashboard", icon: "fa-solid fa-chart-pie" },
    { to: "/categories", label: "Category", icon: "fa-solid fa-list" },
    { to: "/products", label: "Products", icon: "fa-solid fa-boxes-stacked" },
    { to: "/stock-in", label: "Stock In", icon: "fa-solid fa-cart-plus" },
    { to: "/stockout", label: "Stock Out", icon: "fa-solid fa-arrow-right" },
    { to: "/suppliers", label: "Supplier", icon: "fa-solid fa-truck" },
    { to: "/reports", label: "Reports", icon: "fa-solid fa-file-lines" },
    { to: "/low-stock", label: "Low Stock Alerts", icon: "fa-solid fa-triangle-exclamation" },
    { to: "/orders", label: "Orders", icon: "fa-solid fa-basket-shopping" },
    { to: "/purchases", label: "Purchases", icon: "fa-solid fa-truck-fast" },
    { to: "/users", label: "Users", icon: "fa-solid fa-users" }
  ];

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      
      {/* ─── TOP BAR ────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-green-700 to-green-600 flex items-center text-white z-50 shadow-md">
        <div className="hidden md:flex w-72 items-center gap-4 px-8 text-xl font-bold tracking-wide">
          <i className="fa-solid fa-cube text-2xl animate-pulse"></i>
          Inventory System
        </div>
        
        <div className="ml-auto mr-8 flex items-center gap-3 bg-green-800 bg-opacity-30 px-4 py-1.5 rounded-full border border-green-500 border-opacity-30">
          <i className="fa-solid fa-circle-user text-2xl"></i>
          <span className="font-medium text-sm">Veena</span>
          <i className="fa-solid fa-caret-down text-xs opacity-70"></i>
        </div>
      </div>

      {/* ─── SIDEBAR ────────────────────────────────────── */}
      <div className="fixed top-16 bottom-0 left-0 w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-slate-300 hidden md:block overflow-y-auto custom-scrollbar">
        {/* User Profile Section */}
        <div className="p-5 flex gap-4 items-center border-b border-gray-800">
          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            <i className="fa-solid fa-user text-green-600 text-2xl"></i>
          </div>
          <div>
            <h2 className="font-bold text-white text-base">Veena</h2>
            <span className="text-xs text-green-400 font-medium tracking-wider uppercase">Admin</span>
          </div>
        </div>
        
        <nav className="mt-4 px-3 pb-6 space-y-1 text-sm font-medium">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              // Active status validation function injected directly into tailwind classes
              className={({ isActive }) =>
                `w-full flex items-center gap-3.5 px-4 py-3 rounded-lg transition font-semibold ${
                  isActive
                    ? 'bg-green-600 text-white shadow-md' // Full green highlight for active route page item
                    : 'text-slate-300 hover:bg-gray-800 hover:text-white' // Default normal configuration state
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <i className={`${item.icon} text-base w-5 text-center transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}></i>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ─── MAIN CONTENT AREA ──────────────────────────── */}
      <div className="md:pl-72 pt-20 p-6">
        {children}
      </div>

    </div>
  );
}

export default Layout;