import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import API from "../utils/api";
import { clearCart } from "../redux/slices/cartSlice";
import "./CheckoutPage.css";

const STEPS = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const { items, totalPrice } = useSelector((s) => s.cart);
  const { userInfo }          = useSelector((s) => s.auth);
  const dispatch              = useDispatch();
  const navigate              = useNavigate();

  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const shipping  = totalPrice > 5000 ? 0 : 350;
  const tax       = Math.round(totalPrice * 0.16);
  const grandTotal= totalPrice + shipping + tax;

  // Shipping form state
  const [ship, setShip] = useState({
    fullName: userInfo?.name || "",
    street: "", city: "", county: "", phone: "",
  });

  // Payment method
  const [payMethod, setPayMethod] = useState("mpesa");
  const [mpesaPhone, setMpesaPhone] = useState("");

  const updateShip = (e) => setShip({ ...ship, [e.target.name]: e.target.value });

  const handlePlaceOrder = async () => {
    setError(""); setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        product:  i._id,
        name:     i.name,
        image:    i.image,
        price:    i.price,
        size:     i.size,
        color:    i.color,
        quantity: i.quantity,
      }));

      const { data } = await API.post("/orders", {
        orderItems,
        shippingAddress: ship,
        paymentMethod:   payMethod,
        itemsPrice:      totalPrice,
        shippingPrice:   shipping,
        taxPrice:        tax,
        totalPrice:      grandTotal,
      });

      dispatch(clearCart());
      navigate(`/orders/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate("/cart"); return null;
  }

  return (
    <div className="checkout container">
      <h1 className="checkout__title">Checkout</h1>

      {/* Step indicator */}
      <div className="checkout__steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`checkout__step ${i <= step ? "active" : ""} ${i < step ? "done" : ""}`}>
            <div className="checkout__step-num">{i < step ? "✓" : i + 1}</div>
            <span>{s}</span>
            {i < STEPS.length - 1 && <div className="checkout__step-line" />}
          </div>
        ))}
      </div>

      <div className="checkout__layout">
        {/* Left — steps */}
        <div className="checkout__form">

          {/* Step 0 — Shipping */}
          {step === 0 && (
            <div className="checkout__section">
              <h2>Shipping Address</h2>
              <div className="checkout__fields">
                <div className="checkout__field checkout__field--full">
                  <label>Full Name</label>
                  <input name="fullName" value={ship.fullName} onChange={updateShip} placeholder="Your full name" required />
                </div>
                <div className="checkout__field checkout__field--full">
                  <label>Street Address</label>
                  <input name="street" value={ship.street} onChange={updateShip} placeholder="e.g. 123 Kimathi Street" required />
                </div>
                <div className="checkout__field">
                  <label>City</label>
                  <input name="city" value={ship.city} onChange={updateShip} placeholder="e.g. Nairobi" required />
                </div>
                <div className="checkout__field">
                  <label>County</label>
                  <input name="county" value={ship.county} onChange={updateShip} placeholder="e.g. Nairobi County" required />
                </div>
                <div className="checkout__field checkout__field--full">
                  <label>Phone Number</label>
                  <input name="phone" value={ship.phone} onChange={updateShip} placeholder="e.g. 0712 345 678" required />
                </div>
              </div>
              <button
                className="btn-primary checkout__next"
                onClick={() => {
                  if (!ship.fullName || !ship.street || !ship.city || !ship.county || !ship.phone) {
                    setError("Please fill in all shipping fields."); return;
                  }
                  setError(""); setStep(1);
                }}
              >
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div className="checkout__section">
              <h2>Payment Method</h2>

              <div className="checkout__payment-methods">
                {[
                  { id: "mpesa",           label: "M-Pesa",           icon: "📱" },
                  { id: "stripe",          label: "Credit / Debit Card", icon: "💳" },
                  { id: "cash_on_delivery",label: "Cash on Delivery",  icon: "💵" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`payment-method ${payMethod === m.id ? "active" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payMethod === m.id}
                      onChange={() => setPayMethod(m.id)}
                    />
                    <span className="payment-method__icon">{m.icon}</span>
                    <span className="payment-method__label">{m.label}</span>
                  </label>
                ))}
              </div>

              {payMethod === "mpesa" && (
                <div className="checkout__field checkout__field--full" style={{ marginTop: 24 }}>
                  <label>M-Pesa Phone Number</label>
                  <input
                    value={mpesaPhone}
                    onChange={(e) => setMpesaPhone(e.target.value)}
                    placeholder="e.g. 0712 345 678"
                  />
                  <p className="checkout__hint">
                    You will receive an STK push to complete payment
                  </p>
                </div>
              )}

              {payMethod === "stripe" && (
                <div className="checkout__card-notice">
                  <p>💳 Card payment will be set up in Step 7 (Payments integration).</p>
                  <p>For now, select M-Pesa or Cash on Delivery to test the flow.</p>
                </div>
              )}

              <div className="checkout__nav">
                <button className="btn-outline" onClick={() => setStep(0)}>← Back</button>
                <button className="btn-primary checkout__next" onClick={() => { setError(""); setStep(2); }}>
                  Review Order →
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div className="checkout__section">
              <h2>Review Your Order</h2>

              <div className="checkout__review-block">
                <h3>Shipping To</h3>
                <p>{ship.fullName}</p>
                <p>{ship.street}, {ship.city}</p>
                <p>{ship.county}, Kenya</p>
                <p>{ship.phone}</p>
                <button className="checkout__edit" onClick={() => setStep(0)}>Edit</button>
              </div>

              <div className="checkout__review-block">
                <h3>Payment</h3>
                <p>{payMethod === "mpesa" ? `M-Pesa — ${mpesaPhone}` : payMethod === "stripe" ? "Credit / Debit Card" : "Cash on Delivery"}</p>
                <button className="checkout__edit" onClick={() => setStep(1)}>Edit</button>
              </div>

              <div className="checkout__review-items">
                <h3>Items ({items.length})</h3>
                {items.map((item) => (
                  <div key={`${item._id}-${item.size}`} className="checkout__review-item">
                    <div className="checkout__review-img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="cart-item__no-img">No Img</div>
                      }
                    </div>
                    <div>
                      <p className="checkout__review-name">{item.name}</p>
                      {item.size  && <p className="checkout__review-meta">Size: {item.size}</p>}
                      {item.color && <p className="checkout__review-meta">Color: {item.color}</p>}
                      <p className="checkout__review-meta">Qty: {item.quantity}</p>
                    </div>
                    <p className="checkout__review-price">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {error && <p className="error-msg">{error}</p>}

              <div className="checkout__nav">
                <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button
                  className="btn-primary checkout__next"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — order summary */}
        <div className="checkout__summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={`${item._id}-${item.size}`} className="checkout__summary-item">
              <span className="checkout__summary-qty">{item.quantity}×</span>
              <span className="checkout__summary-name">{item.name}</span>
              <span>Ksh {(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout__summary-divider" />
          <div className="checkout__summary-row">
            <span>Subtotal</span><span>Ksh {totalPrice.toLocaleString()}</span>
          </div>
          <div className="checkout__summary-row">
            <span>Shipping</span><span>{shipping === 0 ? "FREE" : `Ksh ${shipping}`}</span>
          </div>
          <div className="checkout__summary-row">
            <span>VAT (16%)</span><span>Ksh {tax.toLocaleString()}</span>
          </div>
          <div className="checkout__summary-total">
            <span>Total</span><span>Ksh {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}