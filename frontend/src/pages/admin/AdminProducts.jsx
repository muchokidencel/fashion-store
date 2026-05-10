import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [total,    setTotal]    = useState(0);
  const navigate = useNavigate();

  const fetchProducts = (p = 1) => {
    setLoading(true);
    API.get(`/products?page=${p}&pageSize=10`)
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
        setTotal(data.total);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/products/${id}`);
      fetchProducts(page);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed.");
    }
  };

  const toggleFeatured = async (product) => {
    try {
      await API.put(`/products/${product._id}`, { isFeatured: !product.isFeatured });
      fetchProducts(page);
    } catch {}
  };

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1>Products</h1>
            <p>{total} products total</p>
          </div>
          <Link to="/admin/products/create" className="btn-primary">+ Add Product</Link>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Featured</th>
                    <th>Published</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="admin-product-img">
                          {p.images?.[0]?.url
                            ? <img src={p.images[0].url} alt={p.name} />
                            : <div className="admin-product-img--empty">No Img</div>
                          }
                        </div>
                      </td>
                      <td>
                        <span className="admin-table__name">{p.name}</span>
                        <span className="admin-table__sub">{p.brand}</span>
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <span>Ksh {p.price.toLocaleString()}</span>
                        {p.discountPrice > 0 && (
                          <span className="admin-table__discount"> → Ksh {p.discountPrice.toLocaleString()}</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`admin-toggle ${p.isFeatured ? "on" : ""}`}
                          onClick={() => toggleFeatured(p)}
                        >
                          {p.isFeatured ? "★ Yes" : "☆ No"}
                        </button>
                      </td>
                      <td>
                        <span className={`admin-badge ${p.isPublished ? "admin-badge--green" : "admin-badge--red"}`}>
                          {p.isPublished ? "Live" : "Hidden"}
                        </span>
                      </td>
                      <td className="admin-table__actions">
                        <Link to={`/admin/products/${p._id}/edit`} className="admin-link">Edit</Link>
                        <button className="admin-link admin-link--red" onClick={() => handleDelete(p._id, p.name)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="pagination" style={{ marginTop: 24 }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination__btn ${p === page ? "active" : ""}`}
                    onClick={() => fetchProducts(p)}
                  >{p}</button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}