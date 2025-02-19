
import { LayoutDashboard, Package2, ShoppingCart, User, Settings } from "lucide-react";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
}

interface SellerSidebarProps {
  items?: SidebarItem[];
}

const defaultItems = [
  { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
  { icon: <Package2 className="h-5 w-5" />, label: "Products" },
  { icon: <ShoppingCart className="h-5 w-5" />, label: "Orders" },
  { icon: <User className="h-5 w-5" />, label: "Profile" },
  { icon: <Settings className="h-5 w-5" />, label: "Settings" },
];

const SellerSidebar = ({ items = defaultItems }: SellerSidebarProps) => {
  return (
    <aside className="w-64 border-r bg-white p-6">
      <h1 className="mb-8 text-xl font-bold">KukuHub</h1>
      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
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
