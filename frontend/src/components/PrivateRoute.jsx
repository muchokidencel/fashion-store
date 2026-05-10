import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Protects routes that require login
export default function PrivateRoute({ children }) {
  const { userInfo } = useSelector((s) => s.auth);
  return userInfo ? children : <Navigate to="/login" replace />;
}