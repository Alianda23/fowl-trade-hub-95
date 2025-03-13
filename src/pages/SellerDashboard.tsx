import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { Plus, MessageSquare, ArrowLeft, User } from "lucide-react";
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
  const [messageCount, setMessageCount] = useState(0);

  const fetchProducts = async () => {
    try {
      // Check authentication
      const authResponse = await fetch('http://localhost:5000/api/seller/check-auth', {
        method: 'GET',
        credentials: 'include'
      });
      
      const authData = await authResponse.json();
      
      if (authData.isAuthenticated) {
        // Fetch seller's products
        const productsResponse = await fetch('http://localhost:5000/api/seller/products', {
          method: 'GET',
          credentials: 'include'
        });
        
        const productsData = await productsResponse.json();
        
        if (productsData.success) {
          setProducts(productsData.products || []);
        }
        
        // Fetch unread message count
        fetchMessageCount();
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchMessageCount = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/messages/count', {
        method: 'GET',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessageCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching message count:", error);
    }
  };

  const handleMessagesLoaded = (count: number) => {
    setMessageCount(count);
  };

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
          console.log("Seller auth check response:", data);
          
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            setSellerEmail(storedEmail);
            
            // Fetch products after confirming authentication
            fetchProducts();
          } else {
            // If backend says not authenticated, clear localStorage and redirect to login
            localStorage.removeItem('isSellerAuthenticated');
            localStorage.removeItem('sellerEmail');
            setIsLoading(false);
            navigate('/seller/login');
          }
        } else {
          setIsLoading(false);
          // If no authentication in localStorage, redirect to login
          navigate('/seller/login');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear localStorage
      localStorage.removeItem('isSellerAuthenticated');
      localStorage.removeItem('sellerEmail');
      
      setIsAuthenticated(false);
      setSellerEmail(null);
      setProducts([]);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      navigate('/seller/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const stats = {
    totalProducts: products.length || 0,
    totalOrders: 0,
    messages: messageCount
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
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
            {isAuthenticated ? (
              <>
                <Button 
                  className="bg-sage-600 hover:bg-sage-700"
                  onClick={() => setShowAddProduct(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
                <Button variant="ghost" onClick={() => setShowMessages(true)} className="relative">
                  <MessageSquare className="h-5 w-5" />
                  {messageCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                      {messageCount}
                    </span>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="gap-2"
                  onClick={() => navigate('/seller/profile')}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{sellerEmail}</span>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button
                className="bg-sage-600 hover:bg-sage-700"
                onClick={() => navigate('/seller/login')}
              >
                Sign In
              </Button>
            )}
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
          
          {!isAuthenticated && (
            <div className="mt-8 rounded-lg border bg-sage-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-medium">Want to sell your products?</h3>
              <p className="mb-4 text-gray-600">Sign in or create a seller account to add and manage products</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/seller/login')}>Sign In</Button>
                <Button variant="outline" onClick={() => navigate('/seller/signup')}>Create Account</Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {isAuthenticated && (
        <>
          <AddProductDialog 
            open={showAddProduct} 
            onOpenChange={setShowAddProduct} 
            onProductAdded={fetchProducts}
          />

          <MessagesDialog 
            open={showMessages} 
            onOpenChange={setShowMessages} 
            onMessagesLoaded={handleMessagesLoaded}
          />
        </>
      )}
    </div>
  );
};

export default SellerDashboard;
