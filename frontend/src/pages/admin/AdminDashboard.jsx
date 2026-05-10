import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get("/orders?pageSize=5"),
      API.get("/products?pageSize=1"),
      API.get("/users"),
    ]).then(([ordersRes, productsRes, usersRes]) => {
      const allOrders = ordersRes.data.orders || [];
      setOrders(allOrders.slice(0, 5));
      setStats({
        totalOrders:   ordersRes.data.total   || 0,
        totalProducts: productsRes.data.total  || 0,
        totalUsers:    usersRes.data.length    || 0,
        totalRevenue:  allOrders.reduce((sum, o) => sum + o.totalPrice, 0),
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColor = {
    pending:    "#f59e0b",
    processing: "#3b82f6",
    shipped:    "#8b5cf6",
    delivered:  "#10b981",
    cancelled:  "#ef4444",
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <h1>Dashboard</h1>
          <p>Welcome back, Admin</p>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="admin-stats">
              {[
                { label: "Total Orders",   value: stats?.totalOrders,   color: "#3b82f6", icon: "📦" },
                { label: "Total Products", value: stats?.totalProducts, color: "#10b981", icon: "👔" },
                { label: "Total Users",    value: stats?.totalUsers,    color: "#8b5cf6", icon: "👥" },
                { label: "Revenue (Ksh)",  value: `${(stats?.totalRevenue || 0).toLocaleString()}`, color: "#c9a84c", icon: "💰" },
              ].map((s) => (
                <div key={s.label} className="admin-stat-card" style={{ borderTopColor: s.color }}>
                  <div className="admin-stat-card__icon">{s.icon}</div>
                  <div className="admin-stat-card__value" style={{ color: s.color }}>{s.value}</div>
                  <div className="admin-stat-card__label">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="admin-quick">
              <h2>Quick Actions</h2>
              <div className="admin-quick__btns">
                <Link to="/admin/products/create" className="btn-primary">+ Add Product</Link>
                <Link to="/admin/orders"   className="btn-outline">View Orders</Link>
                <Link to="/admin/users"    className="btn-outline">Manage Users</Link>
              </div>
            </div>

            {/* Recent orders */}
            <div className="admin-table-wrap">
              <div className="admin-table-header">
                <h2>Recent Orders</h2>
                <Link to="/admin/orders">View All →</Link>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Paid</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="admin-table__mono">#{o._id.slice(-6)}</td>
                      <td>{o.user?.name || "—"}</td>
                      <td>Ksh {o.totalPrice.toLocaleString()}</td>
                      <td>
                        <span className="admin-badge" style={{ color: statusColor[o.status], borderColor: statusColor[o.status] }}>
                          {o.status}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${o.isPaid ? "admin-badge--green" : "admin-badge--amber"}`}>
                          {o.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td><Link to={`/admin/orders/${o._id}`} className="admin-link">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}