
import { ReactNode, useState } from "react";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import OrdersSidebar from "@/components/OrdersSidebar";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Layout = ({ children, searchQuery, setSearchQuery }: LayoutProps) => {
  const { cart, showCart, setShowCart, removeFromCart, updateCartItemQuantity } = useCart();
  const { orders, showOrders, setShowOrders } = useOrders();
  const { isAuthenticated, userEmail, handleLogout } = useAuth();

  return (
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
      
      {children}
      
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
    </>
  );
};

export default Layout;
