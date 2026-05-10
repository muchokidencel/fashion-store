import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Protects routes that require admin role
export default function AdminRoute({ children }) {
  const { userInfo } = useSelector((s) => s.auth);
  return userInfo && userInfo.role === "admin"
    ? children
    : <Navigate to="/login" replace />;
}