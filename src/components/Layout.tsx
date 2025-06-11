
import { ReactNode, useState, useEffect } from "react";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import OrdersSidebar from "@/components/OrdersSidebar";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import MessageDialog from "@/components/MessageDialog";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const Layout = ({ children, searchQuery, setSearchQuery }: LayoutProps) => {
  const { cart, showCart, setShowCart, updateQuantity, removeFromCart } = useCart();
  const { orders, showOrders, setShowOrders } = useOrders();
  const { isAuthenticated, userEmail, handleLogout } = useAuth();
  const [showMessage, setShowMessage] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState<string | null>(null);
  const [currentProductName, setCurrentProductName] = useState<string | null>(null);
  
  const openMessageDialog = (sellerId: string, productName: string) => {
    setCurrentSellerId(sellerId);
    setCurrentProductName(productName);
    setShowMessage(true);
  };

  // Make this function available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).openMessageDialog = openMessageDialog;
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).openMessageDialog;
      }
    };
  }, []);

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
      
      <div className="w-full">
        {children}
      </div>
      
      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
      
      <OrdersSidebar
        showOrders={showOrders}
        setShowOrders={setShowOrders}
        orders={orders}
      />
      
      {/* Floating message button */}
      <div className="fixed bottom-4 right-4 z-10">
        <Button 
          onClick={() => {
            setCurrentSellerId(null);
            setCurrentProductName("General Inquiry");
            setShowMessage(true);
          }}
          className="h-12 w-12 rounded-full bg-sage-600 p-0 shadow-lg hover:bg-sage-700"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      </div>
      
      {/* Message Dialog */}
      {currentSellerId && currentProductName && (
        <MessageDialog
          open={showMessage}
          onOpenChange={setShowMessage}
          productName={currentProductName}
          sellerId={currentSellerId}
        />
      )}
    </>
  );
};

export default Layout;
