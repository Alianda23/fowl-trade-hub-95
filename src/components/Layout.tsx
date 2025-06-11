
import { ReactNode, useState, useEffect } from "react";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import OrdersSidebar from "@/components/OrdersSidebar";
import { useCart } from "@/contexts/CartContext";
import { useOrders } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import MessageDialog from "@/components/MessageDialog";
import UserMessagesDialog from "@/components/user/UserMessagesDialog";
import { MessageSquare, Mail } from "lucide-react";
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
  const [showUserMessages, setShowUserMessages] = useState(false);
  const [currentSellerId, setCurrentSellerId] = useState<string | null>(null);
  const [currentProductName, setCurrentProductName] = useState<string | null>(null);
  const [userMessageCount, setUserMessageCount] = useState(0);
  
  const openMessageDialog = (sellerId: string, productName: string) => {
    setCurrentSellerId(sellerId);
    setCurrentProductName(productName);
    setShowMessage(true);
  };

  const handleUserMessagesLoaded = (count: number) => {
    setUserMessageCount(count);
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
      
      {/* Floating buttons */}
      <div className="fixed bottom-4 right-4 z-10 flex flex-col gap-2">
        {/* User Messages Button - only show if authenticated */}
        {isAuthenticated && (
          <Button 
            onClick={() => setShowUserMessages(true)}
            className="h-12 w-12 rounded-full bg-blue-600 p-0 shadow-lg hover:bg-blue-700 relative"
          >
            <Mail className="h-6 w-6 text-white" />
            {userMessageCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {userMessageCount}
              </span>
            )}
          </Button>
        )}
        
        {/* Contact Seller Button */}
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
      
      {/* Message Dialog for contacting sellers */}
      {currentSellerId && currentProductName && (
        <MessageDialog
          open={showMessage}
          onOpenChange={setShowMessage}
          productName={currentProductName}
          sellerId={currentSellerId}
        />
      )}
      
      {/* User Messages Dialog */}
      <UserMessagesDialog
        open={showUserMessages}
        onOpenChange={setShowUserMessages}
        onMessagesLoaded={handleUserMessagesLoaded}
      />
    </>
  );
};

export default Layout;
