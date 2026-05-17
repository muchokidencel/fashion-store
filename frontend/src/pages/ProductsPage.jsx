import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../utils/api";
import { ProductCard } from "./Home";
import "./ProductsPage.css";

const CATEGORIES = ["All", "Women", "Men", "Kids", "Accessories", "Shoes"];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [pages,     setPages]     = useState(1);
  const [total,     setTotal]     = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const category = searchParams.get("category") || "All";
  const keyword  = searchParams.get("keyword")  || "";
  const page     = Number(searchParams.get("page")) || 1;
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    setLoading(true);
    const params = { page, pageSize: 12 };
    if (category && category !== "All") params.category = category;
    if (keyword)  params.keyword  = keyword;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    API.get("/products", { params })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, keyword, page, minPrice, maxPrice]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== "All") next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
    setFilterOpen(false);
  };

  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="products-page container">
      <div className="products-page__header">
        <h1>{category === "All" ? "All Products" : category}</h1>
        <p>{total} {total === 1 ? "item" : "items"} found</p>
      </div>

      <div className="products-page__layout">
        {/* Mobile filter toggle */}
        <button
          className="filter-toggle"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <span>Filter & Search</span>
          <span>{filterOpen ? "✕" : "≡"}</span>
        </button>

        {/* Sidebar filters */}
        <aside className={`filters ${filterOpen ? "open" : ""}`}>
          <h3>Filters</h3>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={keyword}
              onKeyDown={(e) => {
                if (e.key === "Enter") setParam("keyword", e.target.value);
              }}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Category</label>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-btn ${category === cat || (cat === "All" && !searchParams.get("category")) ? "active" : ""}`}
                onClick={() => setParam("category", cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <label>Price Range (Ksh)</label>
            <div className="filter-price">
              <input type="number" placeholder="Min" defaultValue={minPrice} className="filter-input" onBlur={(e) => setParam("minPrice", e.target.value)} />
              <span>—</span>
              <input type="number" placeholder="Max" defaultValue={maxPrice} className="filter-input" onBlur={(e) => setParam("maxPrice", e.target.value)} />
            </div>
          </div>

          <button className="filter-clear" onClick={() => setSearchParams({})}>
            Clear All Filters
          </button>
        </aside>

        {/* Products */}
        <div className="products-page__content">
          {loading ? (
            <div className="page-loader"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="products-page__empty">
              <p>No products found.</p>
              <button className="btn-outline" onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
              {pages > 1 && (
                <div className="pagination">
                  {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <button key={p} className={`pagination__btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}