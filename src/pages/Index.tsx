import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CartSidebar from "@/components/CartSidebar";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(updatedCart);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('cart');
    setCart([]);
    toast({
      title: "Logged out successfully",
      description: "Come back soon!",
    });
  };

  const addToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      const newCart = existingItem
        ? prevCart.map(item =>
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
      
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
    setShowCart(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleScrollToProducts = () => {
    const productsSection = document.querySelector("#products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <CartSidebar
        showCart={showCart}
        setShowCart={setShowCart}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartItemsCount={cart.length}
        setShowCart={setShowCart}
        isAuthenticated={isAuthenticated}
        userEmail={userEmail}
        handleLogout={handleLogout}
      />

      <HeroSection onBrowseProducts={handleScrollToProducts} />
      
      <CategoriesSection />

      <div id="products-section">
        <ProductsSection searchQuery={searchQuery} onAddToCart={addToCart} />
      </div>

      {/* Features Section */}
      <section className="bg-sage-50 py-16">
        <div className="container">
          <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-wider text-sage-600">
            Why Choose Us
          </h2>
          <h3 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Platform Features
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Verified Sellers",
                description: "All sellers are verified to ensure quality and trust",
              },
              {
                title: "Secure Transactions",
                description: "Safe and secure payment processing for all orders",
              },
              {
                title: "Quality Assurance",
                description: "Strict quality standards for all products",
              },
            ].map((feature) => (
              <Card key={feature.title} className="card-hover border-2">
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sage-900 py-16 text-white">
        <div className="container text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-sage-100">
            Join our platform today and connect with top poultry farmers and buyers
          </p>
          <Link to="/signup">
            <Button
              variant="default"
              size="lg"
              className="bg-white text-sage-900 hover:bg-sage-100"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
