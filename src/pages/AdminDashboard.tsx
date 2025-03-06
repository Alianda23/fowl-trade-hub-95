
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Package2, ShoppingCart, Plus, Pencil, X, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface User {
  user_id: number;
  username: string;
  email: string;
  created_at: string;
}

interface AdminDashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  pendingApprovals: number;
}

const AdminDashboard = () => {
  const [showAdvertDialog, setShowAdvertDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingApprovals: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch users
        const usersResponse = await fetch('http://localhost:5000/api/admin/users', {
          credentials: 'include'
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          if (usersData.success) {
            setUsers(usersData.users || []);
            setStats(prev => ({ ...prev, totalUsers: usersData.users?.length || 0 }));
          }
        }
        
        // Fetch products
        const productsResponse = await fetch('http://localhost:5000/api/products');
        
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          if (productsData.success) {
            // Process product images
            const processedProducts = productsData.products.map((product: any) => {
              if (product.image && product.image.startsWith('/static')) {
                return {
                  ...product,
                  image: `http://localhost:5000${product.image}`
                };
              }
              return product;
            });
            
            setProducts(processedProducts || []);
            setStats(prev => ({ ...prev, totalProducts: productsData.products?.length || 0 }));
          }
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  const sidebarItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", id: 'dashboard' },
    { icon: <Users className="h-5 w-5" />, label: "Users", id: 'users' },
    { icon: <Package2 className="h-5 w-5" />, label: "Products", id: 'products' },
    { icon: <ShoppingCart className="h-5 w-5" />, label: "Orders", id: 'orders' },
  ];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'users':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Users Management</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Created At</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-4 py-3 text-sm">{user.user_id}</td>
                        <td className="px-4 py-3 text-sm">{user.username}</td>
                        <td className="px-4 py-3 text-sm">{user.email}</td>
                        <td className="px-4 py-3 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button variant="outline" size="sm" className="mr-2">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'products':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Products Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="rounded-lg border overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sage-600">KShs {product.price.toLocaleString()}</p>
                        <Button variant="outline" size="sm" onClick={() => navigate(`/products/${product.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center h-64 border rounded-lg">
                  <p className="text-gray-500">No products found</p>
                </div>
              )}
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard Overview</h2>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
        );
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6">
        <h1 className="mb-8 text-xl font-bold">KukuHub Admin</h1>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 ${
                activeTab === item.id 
                  ? 'bg-sage-100 text-sage-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
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
          {renderContent()}
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
