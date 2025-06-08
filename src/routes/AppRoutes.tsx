
import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

// Import pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import ProductDetails from "@/pages/ProductDetails";
import Checkout from "@/pages/Checkout";
import SellerSignup from "@/pages/seller/SellerSignup";
import SellerLogin from "@/pages/seller/SellerLogin";
import SellerDashboard from "@/pages/SellerDashboard";
import SellerOrders from "@/pages/seller/SellerOrders";
import SellerProfile from "@/pages/seller/SellerProfile";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import Users from "@/pages/admin/Users";
import AdminProfile from "@/pages/admin/AdminProfile";
import Reports from "@/pages/admin/Reports";

// Import layout
import Layout from "@/components/Layout";

const AppRoutes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart } = useCart();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          >
            <Index
              searchQuery={searchQuery}
              onAddToCart={addToCart}
            />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={
          <Layout 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          >
            <Login />
          </Layout>
        }
      />
      <Route
        path="/signup"
        element={
          <Layout 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          >
            <Signup />
          </Layout>
        }
      />
      <Route
        path="/product/:productId"
        element={
          <Layout 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          >
            <ProductDetails />
          </Layout>
        }
      />
      <Route
        path="/checkout"
        element={
          <Layout 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
          >
            <Checkout />
          </Layout>
        }
      />

      <Route path="/seller/signup" element={<SellerSignup />} />
      <Route path="/seller/login" element={<SellerLogin />} />
      
      {/* Modified: Changed path from "/seller/dashboard" to "/seller/dashboard" and from "/seller" to match the login redirect */}
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/orders" element={<SellerOrders />} />
      <Route path="/seller/profile" element={<SellerProfile />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Modified: Changed path from "/admin" to "/admin/dashboard" to match the login redirect */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} /> {/* Keep this as a fallback */}
      <Route path="/admin/products" element={<Products />} />
      <Route path="/admin/orders" element={<Orders />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/reports" element={<Reports />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
