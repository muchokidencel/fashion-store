import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

const STATUSES = ["all","pending","processing","shipped","delivered","cancelled"];

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filter,  setFilter]  = useState("all");

  const fetchOrders = (p = 1) => {
    setLoading(true);
    API.get(`/orders?page=${p}&pageSize=15`)
      .then(({ data }) => {
        setOrders(data.orders || []);
        setPages(data.pages);
        setTotal(data.total);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      fetchOrders(page);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  const statusColor = {
    pending:    "#f59e0b",
    processing: "#3b82f6",
    shipped:    "#8b5cf6",
    delivered:  "#10b981",
    cancelled:  "#ef4444",
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1>Orders</h1>
            <p>{total} orders total</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="admin-tabs">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`admin-tab ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o._id}>
                    <td className="admin-table__mono">#{o._id.slice(-6)}</td>
                    <td>
                      <span className="admin-table__name">{o.user?.name || "—"}</span>
                      <span className="admin-table__sub">{o.user?.email}</span>
                    </td>
                    <td>{o.orderItems?.length} item(s)</td>
                    <td>Ksh {o.totalPrice.toLocaleString()}</td>
                    <td>
                      <span className={`admin-badge ${o.isPaid ? "admin-badge--green" : "admin-badge--amber"}`}>
                        {o.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="admin-status-select"
                        value={o.status}
                        style={{ color: statusColor[o.status] }}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        {["pending","processing","shipped","delivered","cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/orders/${o._id}`} className="admin-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="pagination" style={{ marginTop: 24 }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination__btn ${p === page ? "active" : ""}`}
                onClick={() => fetchOrders(p)}
              >{p}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}