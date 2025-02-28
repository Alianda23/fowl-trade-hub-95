
import { Button } from "@/components/ui/button";
import { ShoppingCart, Package2 } from "lucide-react";
import { Link } from "react-router-dom";

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
}: HeaderProps) => {
  return (
    <div className="sticky top-0 z-40 w-full bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <div className="relative flex w-full max-w-md items-center">
          <Link to="/">
            <h1 className="text-xl font-bold text-sage-600">KukuHub</h1>
          </Link>
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
        </div>
      </div>
    </div>
  );
};

export default Header;
