import { Routes, Route } from "react-router-dom";
import Navbar        from "./components/Navbar";
import Footer        from "./components/Footer";
import PrivateRoute  from "./components/PrivateRoute";
import AdminRoute    from "./components/AdminRoute";

// Store pages
import Home          from "./pages/Home";
import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import ProductsPage  from "./pages/ProductsPage";
import ProductDetail from "./pages/ProductDetail";
import CartPage      from "./pages/CartPage";
import CheckoutPage  from "./pages/CheckoutPage";
import OrderPage     from "./pages/OrderPage";
import ProfilePage   from "./pages/ProfilePage";
import MyOrdersPage  from "./pages/MyOrdersPage";
import NotFound      from "./pages/NotFound";

// Admin pages
import AdminDashboard   from "./pages/admin/AdminDashboard";
import AdminProducts    from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders      from "./pages/admin/AdminOrders";
import AdminUsers       from "./pages/admin/AdminUsers";

// Store layout wrapper
const Store = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function App() {
  return (
    <Routes>
      {/* Public store routes */}
      <Route path="/"             element={<Store><Home /></Store>} />
      <Route path="/login"        element={<Store><LoginPage /></Store>} />
      <Route path="/register"     element={<Store><RegisterPage /></Store>} />
      <Route path="/products"     element={<Store><ProductsPage /></Store>} />
      <Route path="/products/:id" element={<Store><ProductDetail /></Store>} />
      <Route path="/cart"         element={<Store><CartPage /></Store>} />

      {/* Private store routes */}
      <Route path="/checkout"  element={<Store><PrivateRoute><CheckoutPage /></PrivateRoute></Store>} />
      <Route path="/orders/:id" element={<Store><PrivateRoute><OrderPage /></PrivateRoute></Store>} />
      <Route path="/orders"    element={<Store><PrivateRoute><MyOrdersPage /></PrivateRoute></Store>} />
      <Route path="/profile"   element={<Store><PrivateRoute><ProfilePage /></PrivateRoute></Store>} />

      {/* Admin routes */}
      <Route path="/admin"                   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/products"          element={<AdminRoute><AdminProducts /></AdminRoute>} />
      <Route path="/admin/products/create"   element={<AdminRoute><AdminProductForm /></AdminRoute>} />
      <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
      <Route path="/admin/orders"            element={<AdminRoute><AdminOrders /></AdminRoute>} />
      <Route path="/admin/users"             element={<AdminRoute><AdminUsers /></AdminRoute>} />

      <Route path="*" element={<Store><NotFound /></Store>} />
    </Routes>
  );
}

export default App;