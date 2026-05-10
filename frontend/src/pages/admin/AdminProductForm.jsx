import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";
import AdminLayout from "../../components/AdminLayout";
import "./Admin.css";

const CATEGORIES = ["Women", "Men", "Kids", "Accessories", "Shoes"];
const SIZES_CLOTHING = ["XS","S","M","L","XL","XXL"];
const SIZES_SHOES    = ["36","37","38","39","40","41","42","43","44","45"];

export default function AdminProductForm() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const isEdit     = Boolean(id);

  const [loading,  setLoading]  = useState(isEdit);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");

  const [form, setForm] = useState({
    name: "", description: "", price: "", discountPrice: "",
    category: "Women", subCategory: "", brand: "",
    colors: "", tags: "", isFeatured: false, isPublished: true,
  });
  const [images, setImages]   = useState([{ url: "", altText: "" }]);
  const [sizes,  setSizes]    = useState([]);

  useEffect(() => {
    if (!isEdit) return;
    API.get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          name:         data.name,
          description:  data.description,
          price:        data.price,
          discountPrice:data.discountPrice || "",
          category:     data.category,
          subCategory:  data.subCategory || "",
          brand:        data.brand || "",
          colors:       data.colors?.join(", ") || "",
          tags:         data.tags?.join(", ")   || "",
          isFeatured:   data.isFeatured,
          isPublished:  data.isPublished,
        });
        setImages(data.images?.length ? data.images : [{ url: "", altText: "" }]);
        setSizes(data.sizes || []);
      })
      .catch(() => setError("Could not load product."))
      .finally(() => setLoading(false));
  }, [id]);

  const updateForm = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const updateImage = (i, field, value) => {
    const updated = [...images];
    updated[i][field] = value;
    setImages(updated);
  };

  const addImage    = () => setImages([...images, { url: "", altText: "" }]);
  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const toggleSize = (size) => {
    const exists = sizes.find((s) => s.size === size);
    if (exists) setSizes(sizes.filter((s) => s.size !== size));
    else setSizes([...sizes, { size, stock: 10 }]);
  };

  const updateStock = (size, stock) => {
    setSizes(sizes.map((s) => s.size === size ? { ...s, stock: Number(stock) } : s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const payload = {
        ...form,
        price:         Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        images:        images.filter((i) => i.url),
        sizes,
        colors: form.colors.split(",").map((c) => c.trim()).filter(Boolean),
        tags:   form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      };

      if (isEdit) {
        await API.put(`/products/${id}`, payload);
        setSuccess("Product updated successfully!");
      } else {
        await API.post("/products", payload);
        setSuccess("Product created successfully!");
        setTimeout(() => navigate("/admin/products"), 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const sizeOptions = form.category === "Shoes" ? SIZES_SHOES : SIZES_CLOTHING;

  if (loading) return <AdminLayout><div className="page-loader"><div className="spinner" /></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="admin-page">
        <div className="admin-page__header">
          <div>
            <h1>{isEdit ? "Edit Product" : "Add New Product"}</h1>
            <p>{isEdit ? `Editing: ${form.name}` : "Fill in the details below"}</p>
          </div>
          <button className="btn-outline" onClick={() => navigate("/admin/products")}>← Back</button>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__grid">

            {/* Left column */}
            <div className="admin-form__col">
              <div className="admin-form-section">
                <h3>Basic Info</h3>
                <div className="admin-field">
                  <label>Product Name *</label>
                  <input name="name" value={form.name} onChange={updateForm} required placeholder="e.g. Classic White Shirt" />
                </div>
                <div className="admin-field">
                  <label>Description *</label>
                  <textarea name="description" value={form.description} onChange={updateForm} required rows={5} placeholder="Describe the product..." />
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Price (Ksh) *</label>
                    <input name="price" type="number" value={form.price} onChange={updateForm} required min="0" placeholder="2500" />
                  </div>
                  <div className="admin-field">
                    <label>Discount Price (Ksh)</label>
                    <input name="discountPrice" type="number" value={form.discountPrice} onChange={updateForm} min="0" placeholder="0" />
                  </div>
                </div>
                <div className="admin-field-row">
                  <div className="admin-field">
                    <label>Category *</label>
                    <select name="category" value={form.category} onChange={updateForm}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="admin-field">
                    <label>Sub Category</label>
                    <input name="subCategory" value={form.subCategory} onChange={updateForm} placeholder="e.g. Tops" />
                  </div>
                </div>
                <div className="admin-field">
                  <label>Brand</label>
                  <input name="brand" value={form.brand} onChange={updateForm} placeholder="e.g. Nike" />
                </div>
                <div className="admin-field">
                  <label>Colors (comma separated)</label>
                  <input name="colors" value={form.colors} onChange={updateForm} placeholder="e.g. Black, White, Navy" />
                </div>
                <div className="admin-field">
                  <label>Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={updateForm} placeholder="e.g. summer, casual, trending" />
                </div>
                <div className="admin-field-row">
                  <label className="admin-checkbox">
                    <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={updateForm} />
                    <span>Featured on homepage</span>
                  </label>
                  <label className="admin-checkbox">
                    <input type="checkbox" name="isPublished" checked={form.isPublished} onChange={updateForm} />
                    <span>Published (visible in store)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="admin-form__col">
              {/* Images */}
              <div className="admin-form-section">
                <h3>Images</h3>
                <p className="admin-form-section__hint">Use direct image URLs (Unsplash, Cloudinary etc)</p>
                {images.map((img, i) => (
                  <div key={i} className="admin-image-row">
                    <div className="admin-image-preview">
                      {img.url
                        ? <img src={img.url} alt="preview" />
                        : <div className="admin-image-preview--empty">Preview</div>
                      }
                    </div>
                    <div className="admin-image-fields">
                      <div className="admin-field">
                        <label>Image URL</label>
                        <input value={img.url} onChange={(e) => updateImage(i, "url", e.target.value)} placeholder="https://..." />
                      </div>
                      <div className="admin-field">
                        <label>Alt Text</label>
                        <input value={img.altText} onChange={(e) => updateImage(i, "altText", e.target.value)} placeholder="Description of image" />
                      </div>
                    </div>
                    {images.length > 1 && (
                      <button type="button" className="admin-image-remove" onClick={() => removeImage(i)}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-outline admin-add-image" onClick={addImage}>+ Add Image</button>
              </div>

              {/* Sizes */}
              <div className="admin-form-section">
                <h3>Sizes & Stock</h3>
                <div className="admin-sizes">
                  {sizeOptions.map((size) => {
                    const selected = sizes.find((s) => s.size === size);
                    return (
                      <div key={size} className={`admin-size-item ${selected ? "active" : ""}`}>
                        <button type="button" className="admin-size-btn" onClick={() => toggleSize(size)}>
                          {size}
                        </button>
                        {selected && (
                          <input
                            type="number"
                            value={selected.stock}
                            onChange={(e) => updateStock(size, e.target.value)}
                            className="admin-size-stock"
                            min="0"
                            title="Stock"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {error   && <p className="error-msg">{error}</p>}
          {success && <p className="success-msg">{success}</p>}

          <div className="admin-form__footer">
            <button type="button" className="btn-outline" onClick={() => navigate("/admin/products")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}