import { useEffect, useState } from "react";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    API.get("/users")
      .then(({ data }) => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await API.put(`/users/${user._id}`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed.");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/users/${user._id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1>Users</h1>
            <p>{users.length} registered users</p>
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="admin-table__name">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-badge ${u.role === "admin" ? "admin-badge--purple" : "admin-badge--gray"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="admin-table__actions">
                      <button className="admin-link" onClick={() => toggleRole(u)}>
                        {u.role === "admin" ? "Make Customer" : "Make Admin"}
                      </button>
                      <button className="admin-link admin-link--red" onClick={() => handleDelete(u)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}