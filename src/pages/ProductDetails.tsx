import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { products as sampleProducts } from "@/data/products";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, MessageSquare, Play } from "lucide-react";
import Copyright from "@/components/Copyright";
import { useState, useEffect } from "react";
import MessageDialog from "@/components/MessageDialog";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [product, setProduct] = useState(sampleProducts.find(p => p.id === productId));
  const [isLoading, setIsLoading] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          // Fallback to sample data if API fails
          setProduct(sampleProducts.find(p => p.id === productId));
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        // Fallback to sample data if API fails
        setProduct(sampleProducts.find(p => p.id === productId));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

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
  
  // Fix URLs if they start with /static
  const imageUrl = product.image?.startsWith('/static') 
    ? `http://localhost:5000${product.image}` 
    : product.image;
  
  const videoUrl = product.video?.startsWith('/static') 
    ? `http://localhost:5000${product.video}` 
    : product.video;

  const renderMedia = () => {
    const hasImage = product.image && product.mediaType !== 'video';
    const hasVideo = product.video && (product.mediaType === 'video' || product.mediaType === 'both');

    if (hasVideo && (showVideo || product.mediaType === 'video')) {
      return (
        <div className="relative">
          <video
            src={videoUrl}
            className="w-full rounded-lg object-cover"
            controls
            poster={hasImage ? imageUrl : undefined}
          />
          {hasImage && (
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-md hover:bg-opacity-70"
            >
              Show Image
            </button>
          )}
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
          {hasVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
            >
              <div className="bg-white bg-opacity-90 rounded-full p-4">
                <Play className="h-8 w-8 text-sage-600" />
              </div>
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No media available</p>
      </div>
    );
  };

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
          {renderMedia()}
          {product.mediaType && (
            <div className="mt-4 flex gap-2">
              {(product.mediaType === 'image' || product.mediaType === 'both') && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                  📷 Image Available
                </span>
              )}
              {(product.mediaType === 'video' || product.mediaType === 'both') && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-md">
                  🎥 Video Available
                </span>
              )}
            </div>
          )}
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
          {product.sellerName && (
            <div className="border-t pt-4">
              <h2 className="mb-2 text-xl font-semibold">Seller</h2>
              <p className="text-gray-600">{product.sellerName}</p>
            </div>
          )}
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
        sellerId={product.sellerId || product.id}
      />

      <Copyright />
    </div>
  );
};

export default ProductDetails;
