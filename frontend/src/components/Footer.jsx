import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__brand">
          <h2>LUXE<span>WEAR</span></h2>
          <p>Premium fashion for the modern wardrobe. Crafted with intention, worn with confidence.</p>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <Link to="/products?category=Women">Women</Link>
          <Link to="/products?category=Men">Men</Link>
          <Link to="/products?category=Kids">Kids</Link>
          <Link to="/products?category=Accessories">Accessories</Link>
        </div>

        <div className="footer__col">
          <h4>Help</h4>
          <Link to="#">Shipping Info</Link>
          <Link to="#">Returns</Link>
          <Link to="#">Size Guide</Link>
          <Link to="#">Contact Us</Link>
        </div>

        <div className="footer__col">
          <h4>Account</h4>
          <Link to="/login">Sign In</Link>
          <Link to="/register">Create Account</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>

      <div className="footer__bottom container">
        <p>© 2026 LUXEWEAR. All rights reserved.</p>
        <p>Built by TechFuse</p>
      </div>
    </footer>
  );
}