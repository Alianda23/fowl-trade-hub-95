
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, User, Package, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BuyerMessagesPanel from "./BuyerMessagesPanel";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartItemsCount: number;
  setShowCart: (show: boolean) => void;
  ordersCount: number;
  setShowOrders: (show: boolean) => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  handleLogout: () => void;
}

const Header = ({
  searchQuery,
  setSearchQuery,
  cartItemsCount,
  setShowCart,
  ordersCount,
  setShowOrders,
  isAuthenticated,
  userEmail,
  handleLogout,
}: HeaderProps) => {
  const navigate = useNavigate();
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 
              className="text-2xl font-bold cursor-pointer text-sage-600" 
              onClick={() => navigate("/")}
            >
              KukuHub
            </h1>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMessagesPanel(true)}
                className="relative"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="sr-only">Messages</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                  {cartItemsCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOrders(true)}
                className="relative"
              >
                <Package className="h-5 w-5" />
                {ordersCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                    {ordersCount}
                  </span>
                )}
                <span className="sr-only">Orders</span>
              </Button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{userEmail}</span>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  <User className="mr-2 h-4 w-4" />
                  Login
                </Button>
                <Button onClick={() => navigate("/signup")} className="bg-sage-600 hover:bg-sage-700">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && userEmail && (
        <BuyerMessagesPanel
          isOpen={showMessagesPanel}
          onClose={() => setShowMessagesPanel(false)}
          userEmail={userEmail}
        />
      )}
    </>
  );
};

export default Header;
