import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";

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

import "./App.css";

interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (e) {
        console.error("Error parsing cart from localStorage", e);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartItemQuantity = (productId: number, newQuantity: number) => {
    setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setCart([]);
  };

  return (
    <Router>
      <div className="flex min-h-screen flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Header
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cartItemsCount={cart.length}
                  setShowCart={setShowCart}
                  ordersCount={orders.length}
                  setShowOrders={setShowOrders}
                  isAuthenticated={isAuthenticated}
                  userEmail={userEmail}
                  handleLogout={handleLogout}
                />
                <Index
                  searchQuery={searchQuery}
                  products={products}
                  loading={loading}
                  handleAddToCart={handleAddToCart}
                />
              </>
            }
          />
          <Route
            path="/login"
            element={
              <>
                <Header
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cartItemsCount={cart.length}
                  setShowCart={setShowCart}
                  ordersCount={orders.length}
                  setShowOrders={setShowOrders}
                  isAuthenticated={isAuthenticated}
                  userEmail={userEmail}
                  handleLogout={handleLogout}
                />
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  setUserEmail={setUserEmail}
                />
              </>
            }
          />
          <Route
            path="/signup"
            element={
              <>
                <Header
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cartItemsCount={cart.length}
                  setShowCart={setShowCart}
                  ordersCount={orders.length}
                  setShowOrders={setShowOrders}
                  isAuthenticated={isAuthenticated}
                  userEmail={userEmail}
                  handleLogout={handleLogout}
                />
                <Signup />
              </>
            }
          />
          <Route
            path="/product/:productId"
            element={
              <>
                <Header
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cartItemsCount={cart.length}
                  setShowCart={setShowCart}
                  ordersCount={orders.length}
                  setShowOrders={setShowOrders}
                  isAuthenticated={isAuthenticated}
                  userEmail={userEmail}
                  handleLogout={handleLogout}
                />
                <ProductDetails handleAddToCart={handleAddToCart} />
              </>
            }
          />
          <Route
            path="/checkout"
            element={
              <>
                <Header
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  cartItemsCount={cart.length}
                  setShowCart={setShowCart}
                  ordersCount={orders.length}
                  setShowOrders={setShowOrders}
                  isAuthenticated={isAuthenticated}
                  userEmail={userEmail}
                  handleLogout={handleLogout}
                />
                <Checkout />
              </>
            }
          />

          <Route path="/seller/signup" element={<SellerSignup />} />
          <Route path="/seller/login" element={<SellerLogin />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/profile" element={<SellerProfile />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/orders" element={<Orders />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/profile" element={<AdminProfile />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <CartSidebar
          showCart={showCart}
          setShowCart={setShowCart}
          cart={cart}
          updateQuantity={updateCartItemQuantity}
          removeFromCart={removeFromCart}
        />
        
        <OrdersSidebar
          showOrders={showOrders}
          setShowOrders={setShowOrders}
          orders={orders}
        />
        
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
