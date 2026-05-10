import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import "./Home.css";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    API.get("/products/featured")
      .then(({ data }) => setFeatured(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">

      {/* Hero */}
      <section className="hero">
        <div className="hero__content">
          <span className="hero__tag">New Collection 2026</span>
          <h1 className="hero__title">
            Dress for the<br />
            <em>Life You Want</em>
          </h1>
          <p className="hero__sub">
            Premium fashion crafted for the modern wardrobe.
            Explore our latest arrivals in women's, men's and kids' wear.
          </p>
          <div className="hero__btns">
            <Link to="/products" className="btn-primary">Shop Now</Link>
            <Link to="/products?category=Women" className="btn-outline">Women's Edit</Link>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__img-wrap">
            <div className="hero__img-placeholder">
              <span>LUXEWEAR</span>
              <p>Add your hero image here</p>
            </div>
          </div>
          <div className="hero__float hero__float--1">Free Shipping<br/>Over Ksh 5,000</div>
          <div className="hero__float hero__float--2">New<br/>Arrivals</div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products">View All →</Link>
        </div>
        <div className="categories__grid">
          {[
            { name: "Women",       emoji: "👗", color: "#f5f0e8" },
            { name: "Men",         emoji: "👔", color: "#e8edf5" },
            { name: "Kids",        emoji: "🧒", color: "#f5e8e8" },
            { name: "Accessories", emoji: "👜", color: "#e8f5ee" },
            { name: "Shoes",       emoji: "👟", color: "#f5f5e8" },
          ].map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="category-card"
              style={{ background: cat.color }}
            >
              <span className="category-card__emoji">{cat.emoji}</span>
              <span className="category-card__name">{cat.name}</span>
              <span className="category-card__arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured container">
        <div className="section-header">
          <h2>Featured Pieces</h2>
          <Link to="/products">See All →</Link>
        </div>
        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : featured.length === 0 ? (
          <div className="featured__empty">
            <p>No featured products yet.</p>
            <Link to="/admin" className="btn-primary">Add Products</Link>
          </div>
        ) : (
          <div className="products-grid">
            {featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="banner">
        <div className="banner__content container">
          <span>Limited Time</span>
          <h2>Up to 40% Off Selected Styles</h2>
          <p>Don't miss out on our end of season sale</p>
          <Link to="/products" className="btn-primary">Shop the Sale</Link>
        </div>
      </section>

      {/* Values */}
      <section className="values container">
        {[
          { icon: "🚚", title: "Free Delivery",  desc: "On all orders over Ksh 5,000" },
          { icon: "↩️", title: "Easy Returns",   desc: "30-day hassle-free returns" },
          { icon: "🔒", title: "Secure Payment", desc: "M-Pesa and card payments" },
          { icon: "💬", title: "24/7 Support",   desc: "We are always here to help" },
        ].map((v) => (
          <div key={v.title} className="value-item">
            <span className="value-item__icon">{v.icon}</span>
            <h4>{v.title}</h4>
            <p>{v.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export function ProductCard({ product }) {
  const image = product.images?.[0]?.url || null;
  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount = product.discountPrice > 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__img">
        {image
          ? <img src={image} alt={product.name} />
          : <div className="product-card__placeholder">No Image</div>
        }
        {hasDiscount && <span className="product-card__badge">Sale</span>}
        {product.isFeatured && !hasDiscount && (
          <span className="product-card__badge product-card__badge--featured">Featured</span>
        )}
      </div>
      <div className="product-card__info">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          <span className="product-card__price--current">Ksh {price.toLocaleString()}</span>
          {hasDiscount && (
            <span className="product-card__price--original">Ksh {product.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
}