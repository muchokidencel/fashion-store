import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import "./MyOrdersPage.css";

const STATUS_COLOR = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  shipped:    "#8b5cf6",
  delivered:  "#10b981",
  cancelled:  "#ef4444",
};

export default function MyOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/myorders")
      .then(({ data }) => setOrders(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="my-orders container">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="my-orders__empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="my-orders__list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card__header">
                <div>
                  <p className="order-card__id">Order #{order._id.slice(-6)}</p>
                  <p className="order-card__date">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
                <div className="order-card__badges">
                  <span
                    className="order-card__status"
                    style={{ color: STATUS_COLOR[order.status], borderColor: STATUS_COLOR[order.status] }}
                  >
                    {order.status}
                  </span>
                  <span className={`order-card__paid ${order.isPaid ? "paid" : "unpaid"}`}>
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <div className="order-card__items">
                {order.orderItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="order-card__item">
                    <div className="order-card__img">
                      {item.image
                        ? <img src={item.image} alt={item.name} />
                        : <div className="order-card__img--empty" />
                      }
                    </div>
                    <span>{item.name}</span>
                    <span>×{item.quantity}</span>
                  </div>
                ))}
                {order.orderItems.length > 3 && (
                  <p className="order-card__more">+{order.orderItems.length - 3} more items</p>
                )}
              </div>

              <div className="order-card__footer">
                <span className="order-card__total">
                  Ksh {order.totalPrice.toLocaleString()}
                </span>
                <Link to={`/orders/${order._id}`} className="btn-outline order-card__btn">
                  View Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}