
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { Plus, MessageSquare, User, LayoutDashboard, Package2, Settings, X, Pencil } from "lucide-react";

type ProductType = {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  stock: number;
  image?: File;
};

const SellerDashboard = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  const stats = {
    totalProducts: products.length || 1,
    totalOrders: 0,
    messages: 0
  };

  const sidebarItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
    { icon: <Package2 className="h-5 w-5" />, label: "Products" },
    { icon: <User className="h-5 w-5" />, label: "Profile" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6">
        <h1 className="mb-8 text-xl font-bold">KukuHub</h1>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
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

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="flex items-center justify-between border-b bg-white p-6">
          <div>
            <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your poultry products and orders</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              className="bg-sage-600 hover:bg-sage-700"
              onClick={() => setShowAddProduct(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
            <Button variant="ghost" onClick={() => setShowMessages(true)}>
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-3 gap-6">
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Total Products</h3>
              <p className="text-3xl font-bold">{stats.totalProducts}</p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Total Orders</h3>
              <p className="text-3xl font-bold">{stats.totalOrders}</p>
            </div>
            <div className="rounded-lg border bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-600">Messages</h3>
              <p className="text-3xl font-bold">{stats.messages}</p>
            </div>
          </div>

          {/* Products List */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Your Products</h2>
            {products.length === 0 ? (
              <div className="rounded-lg border bg-white p-8 text-center">
                <p className="text-gray-500">No products listed yet. Add your first product!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-16 w-16 rounded-lg object-cover" 
                      />
                      <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                        <p className="text-sm font-medium text-sage-600">KShs {product.price}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new product to your inventory
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            setShowAddProduct(false);
            toast({
              title: "Product Added",
              description: "The product has been added to your inventory.",
            });
          }}>
            <div>
              <label className="mb-2 block text-sm font-medium">Product Name</label>
              <input type="text" className="w-full rounded-md border p-2" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Description</label>
              <textarea className="w-full rounded-md border p-2" rows={3} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Category</label>
                <select className="w-full rounded-md border p-2" required>
                  <option value="live-poultry">Live Poultry</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Type</label>
                <select className="w-full rounded-md border p-2" required>
                  <option value="chicks">Chicks</option>
                  <option value="broilers">Broilers</option>
                  <option value="layers">Layers</option>
                  <option value="indigenous">Indigenous</option>
                  <option value="turkeys">Turkeys</option>
                  <option value="ducks">Ducks</option>
                  <option value="geese">Geese</option>
                  <option value="quails">Quails</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Price (KShs)</label>
                <input type="number" className="w-full rounded-md border p-2" required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Stock</label>
                <input type="number" className="w-full rounded-md border p-2" required />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Product Image</label>
              <input type="file" accept="image/*" className="w-full rounded-md border p-2" required />
            </div>
            <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700">
              Add Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Messages Dialog */}
      <Dialog open={showMessages} onOpenChange={setShowMessages}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Messages</DialogTitle>
            <DialogDescription>
              View and respond to customer inquiries
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[200px] text-center text-gray-500">
            No messages yet
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerDashboard;
