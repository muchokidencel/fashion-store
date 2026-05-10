import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { clearCart } from "../redux/slices/cartSlice";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [dropOpen,  setDropOpen]  = useState(false);
  const { userInfo }              = useSelector((s) => s.auth);
  const { totalQuantity }         = useSelector((s) => s.cart);
  const dispatch                  = useDispatch();
  const navigate                  = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setDropOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="navbar__inner container">

        {/* Left — nav links */}
        <nav className={`navbar__links ${menuOpen ? "open" : ""}`}>
          <Link to="/products"                  onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/products?category=Women"   onClick={() => setMenuOpen(false)}>Women</Link>
          <Link to="/products?category=Men"     onClick={() => setMenuOpen(false)}>Men</Link>
          <Link to="/products?category=Kids"    onClick={() => setMenuOpen(false)}>Kids</Link>
        </nav>

        {/* Centre — logo */}
        <Link to="/" className="navbar__logo">
          LUXE<span>WEAR</span>
        </Link>

        {/* Right — icons */}
        <div className="navbar__actions">
          <Link to="/cart" className="navbar__icon" title="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalQuantity > 0 && (
              <span className="navbar__badge">{totalQuantity}</span>
            )}
          </Link>

          {userInfo ? (
            <div className="navbar__user">
              <button
                className="navbar__icon"
                onClick={() => setDropOpen(!dropOpen)}
                title={userInfo.name}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {dropOpen && (
                <>
                  <div className="navbar__overlay" onClick={() => setDropOpen(false)} />
                  <div className="navbar__dropdown">
                    <span className="navbar__dropdown-name">{userInfo.name}</span>
                    <Link to="/profile" onClick={() => setDropOpen(false)}>My Profile</Link>
                    <Link to="/orders"  onClick={() => setDropOpen(false)}>My Orders</Link>
                    {userInfo.role === "admin" && (
                      <Link to="/admin" onClick={() => setDropOpen(false)}>Admin Panel</Link>
                    )}
                    <button onClick={handleLogout}>Sign Out</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__icon" title="Sign In">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </header>
  );
}