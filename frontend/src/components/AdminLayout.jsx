import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import "./AdminLayout.css";

const NAV = [
  { path: "/admin",          icon: "⊞", label: "Dashboard" },
  { path: "/admin/products", icon: "👔", label: "Products"  },
  { path: "/admin/orders",   icon: "📦", label: "Orders"    },
  { path: "/admin/users",    icon: "👥", label: "Users"     },
];

export default function AdminLayout({ children }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/");
  };

  const handleNavClick = () => setMobileOpen(false);

  return (
    <div className={`admin-layout ${collapsed ? "collapsed" : ""}`}>

      {/* Mobile top bar */}
      <div className="admin-mobile-bar">
        <span className="admin-mobile-bar__logo">LUXEWEAR</span>
        <button
          className="admin-mobile-bar__btn"
          onClick={() => setMobileOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar__top">
          <Link to="/admin" className="admin-sidebar__logo" onClick={handleNavClick}>
            {collapsed ? "LW" : "LUXEWEAR"}
          </Link>
          <button
            className="admin-sidebar__toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <p className="admin-sidebar__section">Main</p>

        <nav className="admin-sidebar__nav">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <span className="admin-nav-item__icon">{item.icon}</span>
              {!collapsed && <span className="admin-nav-item__label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar__bottom">
          <Link to="/" className="admin-nav-item" onClick={handleNavClick}>
            <span className="admin-nav-item__icon">🏪</span>
            {!collapsed && <span className="admin-nav-item__label">View Store</span>}
          </Link>
          <button className="admin-nav-item admin-nav-item--btn" onClick={handleLogout}>
            <span className="admin-nav-item__icon">⏻</span>
            {!collapsed && <span className="admin-nav-item__label">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}