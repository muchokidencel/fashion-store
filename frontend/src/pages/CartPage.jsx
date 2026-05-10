import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../redux/slices/cartSlice";
import "./CartPage.css";

export default function CartPage() {
  const { items, totalQuantity, totalPrice } = useSelector((s) => s.cart);
  const { userInfo } = useSelector((s) => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const shipping  = totalPrice > 5000 ? 0 : 350;
  const tax       = Math.round(totalPrice * 0.16);
  const grandTotal= totalPrice + shipping + tax;

  const handleCheckout = () => {
    if (!userInfo) {
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty container">
        <div className="cart-empty__icon">🛍️</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart container">
      <div className="cart__header">
        <h1>Shopping Cart</h1>
        <span>{totalQuantity} {totalQuantity === 1 ? "item" : "items"}</span>
      </div>

      <div className="cart__layout">
        {/* Items */}
        <div className="cart__items">
          {items.map((item) => (
            <div key={`${item._id}-${item.size}-${item.color}`} className="cart-item">
              <div className="cart-item__img">
                {item.image
                  ? <img src={item.image} alt={item.name} />
                  : <div className="cart-item__no-img">No Image</div>
                }
              </div>

              <div className="cart-item__info">
                <Link to={`/products/${item._id}`} className="cart-item__name">
                  {item.name}
                </Link>
                <div className="cart-item__meta">
                  {item.size  && <span>Size: {item.size}</span>}
                  {item.color && <span>Color: {item.color}</span>}
                </div>
                <p className="cart-item__price">Ksh {item.price.toLocaleString()}</p>
              </div>

              <div className="cart-item__qty">
                <button onClick={() => {
                  if (item.quantity === 1) dispatch(removeFromCart(item._id));
                  else dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }));
                }}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() =>
                  dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))
                }>+</button>
              </div>

              <div className="cart-item__subtotal">
                Ksh {(item.price * item.quantity).toLocaleString()}
              </div>

              <button
                className="cart-item__remove"
                onClick={() => dispatch(removeFromCart(item._id))}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}

          <div className="cart__actions">
            <Link to="/products" className="btn-outline">← Continue Shopping</Link>
            <button className="cart__clear" onClick={() => dispatch(clearCart())}>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="cart__summary">
          <h2>Order Summary</h2>

          <div className="cart__summary-rows">
            <div className="cart__summary-row">
              <span>Subtotal ({totalQuantity} items)</span>
              <span>Ksh {totalPrice.toLocaleString()}</span>
            </div>
            <div className="cart__summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `Ksh ${shipping}`}</span>
            </div>
            <div className="cart__summary-row">
              <span>VAT (16%)</span>
              <span>Ksh {tax.toLocaleString()}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="cart__shipping-hint">
              Add Ksh {(5000 - totalPrice).toLocaleString()} more for free shipping
            </p>
          )}

          <div className="cart__summary-total">
            <span>Total</span>
            <span>Ksh {grandTotal.toLocaleString()}</span>
          </div>

          <button className="btn-primary cart__checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>

          <div className="cart__secure">
            🔒 Secure checkout · M-Pesa & Card accepted
          </div>
        </div>
      </div>
    </div>
  );
}