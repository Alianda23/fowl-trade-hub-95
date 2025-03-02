
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, LogIn, Package2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

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

  const logout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        
        // Call the parent component's logout handler
        handleLogout();
        
        // Navigate to home page
        navigate('/');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-40 w-full bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <div className="relative flex w-full max-w-md items-center gap-4">
          <Link to="/">
            <h1 className="text-xl font-bold text-sage-600">KukuHub</h1>
          </Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="relative"
              onClick={() => setShowOrders(true)}
              aria-label="View Orders"
            >
              <Package2 className="h-6 w-6" />
              {ordersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                  {ordersCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className="relative"
              onClick={() => setShowCart(true)}
              aria-label="View Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <Button 
                variant="ghost" 
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className="gap-2">
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
