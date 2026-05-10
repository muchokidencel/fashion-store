import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "sans-serif" }}>
      <h1>404 — Page Not Found</h1>
      <Link to="/">Go back home</Link>
    </div>
  );
}
export default NotFound;