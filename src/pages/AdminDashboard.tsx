import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LayoutDashboard, Users, Package2, ShoppingCart, Plus, Pencil, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [showAdvertDialog, setShowAdvertDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const stats = {
    totalUsers: 45,
    totalProducts: 120,
    totalOrders: 89,
    pendingApprovals: 5
  };

  const sidebarItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", path: "/admin" },
    { icon: <Users className="h-5 w-5" />, label: "Users", path: "/admin/users" },
    { icon: <Package2 className="h-5 w-5" />, label: "Products", path: "/admin/products" },
    { icon: <ShoppingCart className="h-5 w-5" />, label: "Orders", path: "/admin/orders" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6">
        <h1 className="mb-8 text-xl font-bold">KukuHub Admin</h1>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
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

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="flex items-center justify-between border-b bg-white p-6">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your platform</p>
          </div>
          <Button 
            className="bg-sage-600 hover:bg-sage-700"
            onClick={() => setShowAdvertDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Advert
          </Button>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-4 gap-6">
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Total Users</h3>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Total Products</h3>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Total Orders</h3>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Pending Approvals</h3>
              <p className="text-3xl font-bold">{stats.pendingApprovals}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Advert Dialog */}
      <Dialog open={showAdvertDialog} onOpenChange={setShowAdvertDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Advertisement</DialogTitle>
            <DialogDescription>
              Create a new advertisement to display on the platform
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            setShowAdvertDialog(false);
            toast({
              title: "Advertisement Added",
              description: "The advertisement has been published successfully.",
            });
          }}>
            <div>
              <label className="mb-2 block text-sm font-medium">Title</label>
              <input type="text" className="w-full rounded-md border p-2" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea className="w-full rounded-md border p-2" rows={3} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Image</label>
              <input type="file" accept="image/*" className="w-full rounded-md border p-2" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Duration (days)</label>
              <input type="number" min="1" className="w-full rounded-md border p-2" required />
            </div>
            <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700">
              Publish Advertisement
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
