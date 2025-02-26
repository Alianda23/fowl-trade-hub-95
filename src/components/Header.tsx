
import { Button } from "@/components/ui/button";
import { Search, ShoppingCart, LogIn, Package2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartItemsCount: number;
  setShowCart: (show: boolean) => void;
  isAuthenticated: boolean;
  userEmail: string | null;
  handleLogout: () => void;
}

const Header = ({
  searchQuery,
  setSearchQuery,
  cartItemsCount,
  setShowCart,
  isAuthenticated,
  userEmail,
  handleLogout,
}: HeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="sticky top-0 z-40 bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <div className="relative flex w-full max-w-md items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-full border px-10 py-2 focus:border-sage-600 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => navigate('/orders')}
            >
              <Package2 className="h-5 w-5" />
              Orders
            </Button>
          )}
          <Button
            variant="ghost"
            className="relative"
            onClick={() => setShowCart(true)}
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                {cartItemsCount}
              </span>
            )}
          </Button>
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{userEmail}</span>
              <Button 
                variant="ghost" 
                onClick={() => {
                  handleLogout();
                  navigate('/');
                }}
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
