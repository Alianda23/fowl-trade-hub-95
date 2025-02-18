import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";

const SellerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'profile'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

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
            <ProductList products={products} />
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
      </div>
    </div>
  );
};

const ProductList = ({ products }: { products: Product[] }) => {
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
