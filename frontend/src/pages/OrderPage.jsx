import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../utils/api";
import MpesaPayment from "../components/MpesaPayment";
import "./OrderPage.css";

export default function OrderPage() {
  const { id }              = useParams();
  const navigate            = useNavigate();
  const { userInfo }        = useSelector((s) => s.auth);
  const [order,   setOrder] = useState(null);
  const [loading, setLoad]  = useState(true);
  const [error,   setError] = useState("");

  const fetchOrder = () => {
    API.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => setError("Order not found."))
      .finally(() => setLoad(false));
  };

  useEffect(() => { fetchOrder(); }, [id]);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;
  if (error)   return <div className="order-error container"><p>{error}</p></div>;
  if (!order)  return null;

  const statusColors = {
    pending:    "#f59e0b",
    processing: "#3b82f6",
    shipped:    "#8b5cf6",
    delivered:  "#10b981",
    cancelled:  "#ef4444",
  };

  return (
    <div className="order-page container">
      <div className="order-page__header">
        <div className="order-page__icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order. We'll send you an update when it ships.</p>
        <p className="order-page__id">Order ID: <strong>{order._id}</strong></p>
      </div>

      <div className="order-page__layout">
        <div>
          {/* M-Pesa payment widget for unpaid M-Pesa orders */}
          {!order.isPaid && order.paymentMethod === "mpesa" && (
            <div className="order-block">
              <h2>Complete Your Payment</h2>
              <MpesaPayment
                orderId={order._id}
                totalPrice={order.totalPrice}
                onSuccess={fetchOrder}
              />
            </div>
          )}

          {/* Items */}
          <div className="order-block">
            <h2>Items Ordered</h2>
            {order.orderItems.map((item, i) => (
              <div key={i} className="order-item">
                <div className="order-item__img">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <div className="order-item__no-img">No Img</div>
                  }
                </div>
                <div className="order-item__info">
                  <p className="order-item__name">{item.name}</p>
                  {item.size  && <p className="order-item__meta">Size: {item.size}</p>}
                  {item.color && <p className="order-item__meta">Color: {item.color}</p>}
                  <p className="order-item__meta">Qty: {item.quantity}</p>
                </div>
                <p className="order-item__price">
                  Ksh {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping */}
          <div className="order-block">
            <h2>Shipping Address</h2>
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.county}</p>
            <p>{order.shippingAddress.country}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>

          {/* Payment */}
          <div className="order-block">
            <h2>Payment</h2>
            <p>Method: <strong>{order.paymentMethod}</strong></p>
            <p>Status: <strong style={{ color: order.isPaid ? "#10b981" : "#f59e0b" }}>
              {order.isPaid ? "Paid" : "Pending Payment"}
            </strong></p>
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="order-page__summary">
          <div className="order-status" style={{ borderColor: statusColors[order.status] }}>
            <span className="order-status__label">Order Status</span>
            <span className="order-status__value" style={{ color: statusColors[order.status] }}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="order-block">
            <h2>Price Summary</h2>
            <div className="order-summary-row">
              <span>Items</span>
              <span>Ksh {order.itemsPrice.toLocaleString()}</span>
            </div>
            <div className="order-summary-row">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? "FREE" : `Ksh ${order.shippingPrice}`}</span>
            </div>
            <div className="order-summary-row">
              <span>VAT</span>
              <span>Ksh {order.taxPrice.toLocaleString()}</span>
            </div>
            <div className="order-summary-total">
              <span>Total</span>
              <span>Ksh {order.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <Link to="/products" className="btn-primary order-page__shop-btn">
            Continue Shopping
          </Link>
          <Link to="/orders" className="btn-outline order-page__orders-btn">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}