
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "@/data/products";
import { Plus, MessageSquare, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductList from "@/components/seller/ProductList";
import AddProductDialog from "@/components/seller/AddProductDialog";
import MessagesDialog from "@/components/seller/MessagesDialog";

const SellerDashboard = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  const stats = {
    totalProducts: products.length || 1,
    totalOrders: 0,
    messages: 0
  };

  return (
    <div className="flex min-h-screen">
      <SellerSidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="flex items-center justify-between border-b bg-white p-6">
          <div>
            <div className="mb-4 flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Seller Dashboard</h1>
            </div>
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

          <ProductList products={products} />
        </div>
      </main>

      <AddProductDialog 
        open={showAddProduct} 
        onOpenChange={setShowAddProduct} 
      />

      <MessagesDialog 
        open={showMessages} 
        onOpenChange={setShowMessages} 
      />
    </div>
  );
};

export default SellerDashboard;
