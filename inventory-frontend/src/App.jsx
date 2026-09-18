import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import Categories from './pages/categories';
import StockIn from './pages/StockIn';
import StockOut from './pages/StockOut';
import Suppliers from './pages/suppliers';
import Reports from './pages/Reports';
import LowStock from './pages/LowStock';
import Orders from './pages/Orders';
import Purchases from './pages/Purchases'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/users" element={<Users />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/stock-in" element={<StockIn />} />
        <Route path="/stockout" element={<StockOut />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/low-stock" element={<LowStock />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/purchases" element={<Purchases />} />
      </Routes>
    </Layout>
  );
}

export default App;