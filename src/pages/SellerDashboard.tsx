
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { Plus, MessageSquare, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "@/components/seller/SellerSidebar";
import ProductList from "@/components/seller/ProductList";
import AddProductDialog from "@/components/seller/AddProductDialog";
import MessagesDialog from "@/components/seller/MessagesDialog";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sellerEmail, setSellerEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated in localStorage
        const storedAuth = localStorage.getItem('isSellerAuthenticated');
        const storedEmail = localStorage.getItem('sellerEmail');
        
        if (storedAuth === 'true' && storedEmail) {
          // Verify with backend
          const response = await fetch('http://localhost:5000/api/seller/check-auth', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (data.authenticated && data.user_type === 'seller') {
            setIsAuthenticated(true);
            setSellerEmail(storedEmail);
          } else {
            // If backend says not authenticated, clear localStorage and redirect
            localStorage.removeItem('isSellerAuthenticated');
            localStorage.removeItem('sellerEmail');
            navigate('/seller/login');
          }
        } else {
          // No stored auth, redirect to login
          navigate('/seller/login');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        navigate('/seller/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear localStorage
      localStorage.removeItem('isSellerAuthenticated');
      localStorage.removeItem('sellerEmail');
      
      // Redirect to login
      navigate('/seller/login');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = {
    totalProducts: products.length || 1,
    totalOrders: 0,
    messages: 0
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

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
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{sellerEmail}</span>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </div>
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
