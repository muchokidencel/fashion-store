import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../redux/slices/authSlice";
import API from "../utils/api";
import { showToast } from "../components/Toast";
import "./ProfilePage.css";

export default function ProfilePage() {
  const { userInfo }  = useSelector((s) => s.auth);
  const dispatch      = useDispatch();

  const [name,     setName]     = useState(userInfo?.name     || "");
  const [email,    setEmail]    = useState(userInfo?.email    || "");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [saving,   setSaving]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password && password !== confirm) {
      showToast("Passwords do not match.", "error"); return;
    }
    setSaving(true);
    try {
      const body = { name, email };
      if (password) body.password = password;
      const { data } = await API.put("/auth/profile", body);
      dispatch(setCredentials(data));
      showToast("Profile updated successfully!");
      setPassword(""); setConfirm("");
    } catch (err) {
      showToast(err.response?.data?.message || "Update failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page container">
      <h1>My Profile</h1>
      <div className="profile-card">
        <div className="profile-avatar">
          {userInfo?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2>{userInfo?.name}</h2>
          <p>{userInfo?.email}</p>
          <span className={`profile-role ${userInfo?.role}`}>{userInfo?.role}</span>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <h2>Update Details</h2>
        <div className="profile-fields">
          <div className="auth-field">
            <label>Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>New Password (leave blank to keep current)</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="auth-field">
            <label>Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}