import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProductsSection from "@/components/ProductsSection";
import { useState } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { Search, ShoppingCart, User, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const categories = [
  {
    title: "Live Poultry",
    description: "Browse quality live poultry from verified sellers",
    image: "/placeholder.svg"
  },
  {
    title: "Poultry Products",
    description: "Fresh eggs, meat, and processed products",
    image: "/placeholder.svg"
  },
  {
    title: "Feeds & Supplements",
    description: "High-quality feeds and nutritional supplements",
    image: "/placeholder.svg"
  },
  {
    title: "Equipment & Supplies",
    description: "Essential farming equipment and supplies",
    image: "/placeholder.svg"
  }
];

interface CartItem extends Product {
  quantity: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 z-50 h-full w-96 transform bg-white p-6 shadow-lg transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <Button variant="ghost" onClick={() => setShowCart(false)}>×</Button>
        </div>
        
        {cart.length === 0 ? (
          <p className="mt-4 text-gray-500">Your cart is empty</p>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-4 overflow-auto py-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">KShs {item.price.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >-</Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >×</Button>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="mb-4 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-bold">KShs {cartTotal.toLocaleString()}</span>
              </div>
              <Button 
                className="w-full bg-sage-600 hover:bg-sage-700"
                onClick={() => {
                  toast({
                    title: "Proceeding to checkout",
                    description: "This is a demo version. Payment processing requires backend integration.",
                  });
                }}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Header with Search, Cart, and Auth */}
      <div className="sticky top-0 z-40 bg-white shadow">
        <div className="container flex items-center justify-between py-4">
          <div className="relative flex w-full max-w-md items-center">
            <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border px-10 py-2 focus:border-sage-600 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="relative"
              onClick={() => setShowCart(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage-600 text-xs text-white">
                  {cart.length}
                </span>
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="gap-2">
                <LogIn className="h-5 w-5" />
                Login
              </Button>
            </Link>
            <Button variant="ghost">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-sage-900/40" />
        <div className="container relative flex h-full flex-col items-center justify-center text-white">
          <p className="mb-2 animate-fadeIn text-sm font-medium uppercase tracking-wider text-sage-100">
            Welcome to
          </p>
          <h1 className="mb-6 animate-fadeIn text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            KukuHub
          </h1>
          <p className="mb-8 animate-fadeIn text-center text-lg text-sage-100 sm:text-xl">
            Connect with trusted poultry farmers and suppliers
          </p>
          <div className="flex animate-fadeIn gap-4">
            <Button
              variant="default"
              size="lg"
              className="bg-sage-600 text-white hover:bg-sage-700"
              onClick={() => {
                const productsSection = document.querySelector("#products-section");
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Browse Products
            </Button>
            <Link to="/seller/signup">
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white/10"
              >
                Become a Seller
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-wider text-sage-600">
          Our Categories
        </h2>
        <h3 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Explore Our Products
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category.title}
              className="card-hover overflow-hidden border-2 border-transparent transition-colors hover:border-sage-200"
            >
              <CardHeader className="p-0">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2 text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Products Section with search and cart functionality */}
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
