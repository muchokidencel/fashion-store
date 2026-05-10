import { useState } from "react";
import API from "../utils/api";
import "./MpesaPayment.css";

export default function MpesaPayment({ orderId, totalPrice, onSuccess }) {
  const [phone,    setPhone]    = useState("");
  const [step,     setStep]     = useState("form");   // form | waiting | done | error
  const [checkoutId, setCheckoutId] = useState("");
  const [message,  setMessage]  = useState("");
  const [polling,  setPolling]  = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setStep("waiting");
    setMessage("");

    try {
      const { data } = await API.post("/payments/mpesa/stk", { orderId, phone });
      setCheckoutId(data.checkoutRequestId);
      setMessage(data.message);
      // Start polling for payment confirmation
      startPolling(data.checkoutRequestId);
    } catch (err) {
      setStep("error");
      setMessage(err.response?.data?.message || "Payment initiation failed.");
    }
  };

  const startPolling = (checkoutRequestId) => {
    setPolling(true);
    let attempts = 0;
    const maxAttempts = 12; // Poll for 60 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const { data } = await API.post("/payments/mpesa/query", {
          checkoutRequestId,
          orderId,
        });

        if (data.paid) {
          clearInterval(interval);
          setPolling(false);
          setStep("done");
          setMessage("Payment confirmed! Your order is being processed.");
          if (onSuccess) onSuccess();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setStep("error");
          setMessage("Payment timed out. Please check your M-Pesa messages and try again.");
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setStep("error");
          setMessage("Could not verify payment. Please contact support.");
        }
      }
    }, 5000); // Check every 5 seconds
  };

  return (
    <div className="mpesa">
      <div className="mpesa__header">
        <span className="mpesa__logo">M</span>
        <div>
          <h3>Pay with M-Pesa</h3>
          <p>Ksh {totalPrice?.toLocaleString()}</p>
        </div>
      </div>

      {step === "form" && (
        <form onSubmit={handlePay} className="mpesa__form">
          <div className="mpesa__field">
            <label>M-Pesa Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0712 345 678"
              required
            />
            <p className="mpesa__hint">
              Enter the phone number registered with M-Pesa
            </p>
          </div>
          <button type="submit" className="btn-primary mpesa__btn">
            Send Payment Request
          </button>
        </form>
      )}

      {step === "waiting" && (
        <div className="mpesa__waiting">
          <div className="mpesa__pulse" />
          <h3>Check your phone!</h3>
          <p>{message}</p>
          <p className="mpesa__sub">Enter your M-Pesa PIN when prompted.</p>
          {polling && (
            <p className="mpesa__polling">
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Waiting for confirmation...
            </p>
          )}
          <button
            className="btn-outline mpesa__retry"
            onClick={() => setStep("form")}
          >
            Try Different Number
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="mpesa__done">
          <div className="mpesa__done-icon">✓</div>
          <h3>Payment Successful!</h3>
          <p>{message}</p>
        </div>
      )}

      {step === "error" && (
        <div className="mpesa__error">
          <div className="mpesa__error-icon">✕</div>
          <h3>Payment Failed</h3>
          <p>{message}</p>
          <button className="btn-primary mpesa__btn" onClick={() => setStep("form")}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}