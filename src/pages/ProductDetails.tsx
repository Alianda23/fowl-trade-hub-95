
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, MessageSquare } from "lucide-react";
import Copyright from "@/components/Copyright";
import { useState } from "react";
import MessageDialog from "@/components/MessageDialog";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  const product = products.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <Button onClick={() => navigate("/")} className="bg-sage-600 hover:bg-sage-700">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // If product exists, increase quantity
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // If product doesn't exist, add it with quantity 1
      existingCart.push({ ...product, quantity: 1 });
    }
    
    // Save updated cart back to localStorage
    localStorage.setItem('cart', JSON.stringify(existingCart));
    
    // Show success toast
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });

    // Trigger a custom event to notify Index.tsx to update cart
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  return (
    <div className="container min-h-screen flex flex-col py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-6 w-fit"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-xl font-bold text-sage-600">
            KShs {product.price.toLocaleString()}
          </p>
          <div className="border-t pt-4">
            <h2 className="mb-2 text-xl font-semibold">Description</h2>
            <p className="text-gray-600">{product.description}</p>
          </div>
          <div className="border-t pt-4">
            <h2 className="mb-2 text-xl font-semibold">Category</h2>
            <p className="text-gray-600">{product.category}</p>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              className="flex-1 bg-sage-600 hover:bg-sage-700"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowMessageDialog(true)}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Message Seller
            </Button>
          </div>
        </div>
      </div>

      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        productName={product.name}
        sellerId={product.id}
      />

      <Copyright />
    </div>
  );
};

export default ProductDetails;
