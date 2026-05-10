import { useEffect, useState } from "react";
import "./Toast.css";

// Global toast state
let toastFn = null;

export const showToast = (message, type = "success") => {
  if (toastFn) toastFn(message, type);
};

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastFn = (message, type) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    };
    return () => { toastFn = null; };
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <span className="toast__icon">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span className="toast__msg">{t.message}</span>
          <button className="toast__close" onClick={() => remove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}