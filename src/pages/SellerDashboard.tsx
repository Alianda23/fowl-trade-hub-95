
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product, categories } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

interface CartItem extends Product {
  quantity: number;
}

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile' | 'cart'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

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
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
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
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Seller Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div className="mb-8 flex gap-4 border-b">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className={activeTab === 'products' ? 'bg-sage-600' : ''}
        >
          Products
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('orders')}
          className={activeTab === 'orders' ? 'bg-sage-600' : ''}
        >
          Orders
        </Button>
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('profile')}
          className={activeTab === 'profile' ? 'bg-sage-600' : ''}
        >
          Profile
        </Button>
        <Button
          variant={activeTab === 'cart' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('cart')}
          className={activeTab === 'cart' ? 'bg-sage-600' : ''}
        >
          Cart ({cart.length})
        </Button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'products' && (
          <div>
            <div className="mb-6 flex justify-between">
              <h2 className="text-2xl font-semibold">My Products</h2>
              <Button 
                className="bg-sage-600 hover:bg-sage-700"
                onClick={() => setActiveTab('products')}
              >
                Add New Product
              </Button>
            </div>
            <ProductList products={products} onAddToCart={addToCart} />
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Orders</h2>
            <p className="text-gray-500">No orders yet.</p>
          </div>
        )}
        
        {activeTab === 'profile' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Profile Settings</h2>
            <SellerProfile />
          </div>
        )}

        {activeTab === 'cart' && (
          <div>
            <h2 className="mb-6 text-2xl font-semibold">Shopping Cart</h2>
            {cart.length === 0 ? (
              <p className="text-gray-500">Your cart is empty.</p>
            ) : (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="h-24 w-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-600">KShs {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <div className="mb-4 flex justify-between">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold">KShs {cartTotal.toLocaleString()}</span>
                  </div>
                  <Button 
                    className="w-full bg-sage-600 hover:bg-sage-700"
                    onClick={() => {
                      toast({
                        title: "Payment Not Available",
                        description: "This is a demo version. Payment processing requires backend integration.",
                      });
                    }}
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ProductList = ({ 
  products, 
  onAddToCart 
}: { 
  products: Product[],
  onAddToCart: (product: Product) => void
}) => {
  const { toast } = useToast();
  
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500">No products listed yet. Add your first product!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <div key={product.id} className="rounded-lg border p-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="mb-4 h-48 w-full rounded-lg object-cover" 
          />
          <h3 className="mb-2 text-lg font-semibold">{product.name}</h3>
          <p className="mb-2 text-sm text-gray-600">{product.description}</p>
          <p className="font-bold text-sage-600">KShs {product.price.toLocaleString()}</p>
          <div className="mt-4 flex gap-2">
            <Button 
              variant="default" 
              size="sm" 
              className="bg-sage-600 hover:bg-sage-700"
              onClick={() => onAddToCart(product)}
            >
              Add to Cart
            </Button>
            <Button variant="outline" size="sm">Edit</Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const SellerProfile = () => {
  return (
    <div className="max-w-2xl space-y-6 rounded-lg border p-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Business Name</label>
        <input 
          type="text"
          className="w-full rounded-md border p-2"
          placeholder="Your business name"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Contact Email</label>
        <input 
          type="email"
          className="w-full rounded-md border p-2"
          placeholder="contact@example.com"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Phone Number</label>
        <input 
          type="tel"
          className="w-full rounded-md border p-2"
          placeholder="+254 XXX XXX XXX"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Business Description</label>
        <textarea 
          className="w-full rounded-md border p-2"
          rows={4}
          placeholder="Tell customers about your poultry business..."
        />
      </div>
      <Button className="bg-sage-600 hover:bg-sage-700">Save Changes</Button>
    </div>
  );
};

export default SellerDashboard;
