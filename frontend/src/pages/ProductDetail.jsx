import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../utils/api";
import { addToCart } from "../redux/slices/cartSlice";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const dispatch     = useDispatch();
  const { userInfo } = useSelector((s) => s.auth);

  const [product,     setProduct]     = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [selImage,    setSelImage]    = useState(0);
  const [selSize,     setSelSize]     = useState("");
  const [selColor,    setSelColor]    = useState("");
  const [quantity,    setQuantity]    = useState(1);
  const [added,       setAdded]       = useState(false);

  // Review form
  const [rating,      setRating]      = useState(5);
  const [comment,     setComment]     = useState("");
  const [reviewMsg,   setReviewMsg]   = useState("");
  const [reviewErr,   setReviewErr]   = useState("");

  useEffect(() => {
    setLoading(true);
    API.get(`/products/${id}`)
      .then(({ data }) => { setProduct(data); })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selSize) {
      alert("Please select a size"); return;
    }
    dispatch(addToCart({
      _id:   product._id,
      name:  product.name,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
      image: product.images?.[0]?.url || "",
      size:  selSize,
      color: selColor,
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setReviewErr(""); setReviewMsg("");
    if (!userInfo) { navigate("/login"); return; }
    try {
      await API.post(`/products/${id}/reviews`, { rating, comment });
      setReviewMsg("Review submitted!");
      setComment(""); setRating(5);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setReviewErr(err.response?.data?.message || "Could not submit review.");
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error)   return <div className="pd-error container"><p>{error}</p></div>;
  if (!product) return null;

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;
  const inStock = product.sizes?.some((s) => s.stock > 0) ?? true;

  return (
    <div className="pd container">

      {/* Breadcrumb */}
      <nav className="pd__breadcrumb">
        <span onClick={() => navigate("/")}>Home</span>
        <span>/</span>
        <span onClick={() => navigate("/products")}>Shop</span>
        <span>/</span>
        <span onClick={() => navigate(`/products?category=${product.category}`)}>
          {product.category}
        </span>
        <span>/</span>
        <span className="pd__breadcrumb--active">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="pd__layout">

        {/* Images */}
        <div className="pd__images">
          <div className="pd__thumbs">
            {product.images?.map((img, i) => (
              <div
                key={i}
                className={`pd__thumb ${selImage === i ? "active" : ""}`}
                onClick={() => setSelImage(i)}
              >
                <img src={img.url} alt={img.altText || product.name} />
              </div>
            ))}
            {(!product.images || product.images.length === 0) && (
              <div className="pd__no-image">No Images</div>
            )}
          </div>

          <div className="pd__main-img">
            {product.images?.[selImage] ? (
              <img
                src={product.images[selImage].url}
                alt={product.images[selImage].altText || product.name}
              />
            ) : (
              <div className="pd__no-image pd__no-image--lg">No Image</div>
            )}
            {product.discountPrice > 0 && (
              <span className="pd__badge">Sale</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="pd__info">
          <p className="pd__category">{product.category}</p>
          <h1 className="pd__name">{product.name}</h1>

          {product.brand && <p className="pd__brand">{product.brand}</p>}

          {/* Rating */}
          <div className="pd__rating">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
            <span>({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="pd__price">
            <span className="pd__price--current">Ksh {price.toLocaleString()}</span>
            {product.discountPrice > 0 && (
              <span className="pd__price--original">Ksh {product.price.toLocaleString()}</span>
            )}
          </div>

          <p className="pd__desc">{product.description}</p>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="pd__option">
              <label>Color: <strong>{selColor || "Select"}</strong></label>
              <div className="pd__colors">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    className={`pd__color ${selColor === c ? "active" : ""}`}
                    style={{ background: c.toLowerCase() }}
                    onClick={() => setSelColor(c)}
                    title={c}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="pd__option">
              <label>Size: <strong>{selSize || "Select"}</strong></label>
              <div className="pd__sizes">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    className={`pd__size ${selSize === s.size ? "active" : ""} ${s.stock === 0 ? "out" : ""}`}
                    onClick={() => s.stock > 0 && setSelSize(s.size)}
                    disabled={s.stock === 0}
                  >
                    {s.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pd__option">
            <label>Quantity</label>
            <div className="pd__qty">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Add to cart */}
          <button
            className={`pd__add-btn btn-primary ${added ? "added" : ""}`}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {!inStock ? "Out of Stock" : added ? "Added to Cart ✓" : "Add to Cart"}
          </button>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="pd__tags">
              {product.tags.map((t) => (
                <span key={t} className="pd__tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="pd__reviews">
        <h2>Customer Reviews ({product.numReviews})</h2>

        {product.reviews?.length === 0 && (
          <p className="pd__no-reviews">No reviews yet. Be the first!</p>
        )}

        <div className="pd__reviews-list">
          {product.reviews?.map((r) => (
            <div key={r._id} className="pd__review">
              <div className="pd__review-header">
                <strong>{r.name}</strong>
                <span className="pd__review-stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                <span className="pd__review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>

        {/* Write review */}
        <div className="pd__write-review">
          <h3>Write a Review</h3>
          {!userInfo && <p className="pd__review-login">Please <span onClick={() => navigate("/login")}>sign in</span> to write a review.</p>}
          {userInfo && (
            <form onSubmit={handleReview} className="pd__review-form">
              <div className="pd__review-rating">
                <label>Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[5,4,3,2,1].map((n) => (
                    <option key={n} value={n}>{n} Star{n !== 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="pd__review-comment">
                <label>Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your thoughts about this product..."
                  required
                />
              </div>
              {reviewMsg && <p className="success-msg">{reviewMsg}</p>}
              {reviewErr && <p className="error-msg">{reviewErr}</p>}
              <button type="submit" className="btn-primary">Submit Review</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}