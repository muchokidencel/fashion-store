import { useEffect } from "react";
import { useSelector } from "react-redux";
import API from "../utils/api";
import "./PaystackPayment.css";

export default function PaystackPayment({ orderId, totalPrice, onSuccess }) {
  const { userInfo } = useSelector((s) => s.auth);

  // Load Paystack inline script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePay = () => {
    const handler = window.PaystackPop.setup({
      key:       import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:     userInfo?.email,
      amount:    Math.ceil(totalPrice * 100), // Paystack uses kobo/cents
      currency:  "KES",
      ref:       `order_${orderId}_${Date.now()}`,
      metadata: {
        orderId,
        custom_fields: [
          {
            display_name:  "Order ID",
            variable_name: "order_id",
            value:         orderId,
          },
        ],
      },
      callback: async (response) => {
        try {
          const { data } = await API.post("/payments/paystack/verify", {
            reference: response.reference,
            orderId,
          });
          if (data.success) {
            onSuccess?.();
          }
        } catch (err) {
          console.error("Verification failed:", err);
        }
      },
      onClose: () => {
        console.log("Payment popup closed");
      },
    });
    handler.openIframe();
  };

  return (
    <div className="paystack">
      <div className="paystack__header">
        <div className="paystack__logo">P</div>
        <div>
          <h3>Pay with Paystack</h3>
          <p>Ksh {totalPrice?.toLocaleString()}</p>
        </div>
      </div>

      <div className="paystack__info">
        <p>✓ Visa, Mastercard and local cards accepted</p>
        <p>✓ Secure 256-bit SSL encryption</p>
        <p>✓ Instant payment confirmation</p>
      </div>

      <button className="btn-primary paystack__btn" onClick={handlePay}>
        Pay Ksh {totalPrice?.toLocaleString()} Now
      </button>

      <p className="paystack__powered">
        Secured by <strong>Paystack</strong>
      </p>
    </div>
  );
}