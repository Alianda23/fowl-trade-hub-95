
import { LayoutDashboard, Package2, ShoppingCart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

interface SellerSidebarProps {
  items?: SidebarItem[];
}

const defaultItems = [
  { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/seller" },
  { icon: <Package2 className="h-5 w-5" />, label: "Products", path: "/seller" },
  { icon: <ShoppingCart className="h-5 w-5" />, label: "Orders", path: "/seller/orders" },
  { icon: <User className="h-5 w-5" />, label: "Profile", path: "/seller" },
];

const SellerSidebar = ({ items = defaultItems }: SellerSidebarProps) => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 border-r bg-white p-6">
      <h1 className="mb-8 text-xl font-bold">KukuHub</h1>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SellerSidebar;
