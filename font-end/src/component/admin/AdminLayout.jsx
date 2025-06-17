import React from "react";
import { Outlet } from "react-router-dom";
import '../../style/adminLayout.css'

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><a href="/admin">Dashboard</a></li>
          <li><a href="/admin/categories">Manage Categories</a></li>
          <li><a href="/admin/products">Manage Products</a></li>
          <li><a href="/admin/orders">Manage Orders</a></li>
        </ul>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
