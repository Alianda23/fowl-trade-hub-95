
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Product } from "@/data/products";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, MessageSquare, Play } from "lucide-react";
import { useState } from "react";
import MessageDialog from "./MessageDialog";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
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
        <div className="aspect-square w-full overflow-hidden relative">
          <video
            src={videoUrl}
            className="h-full w-full object-cover"
            controls
            poster={hasImage ? imageUrl : undefined}
          />
          {hasImage && (
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-md text-sm hover:bg-opacity-70"
            >
              Show Image
            </button>
          )}
        </div>
      );
    }

    if (hasImage) {
      return (
        <div className="aspect-square w-full overflow-hidden relative">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {hasVideo && (
            <button
              onClick={() => setShowVideo(true)}
              className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
            >
              <div className="bg-white bg-opacity-90 rounded-full p-3">
                <Play className="h-6 w-6 text-sage-600" />
              </div>
            </button>
          )}
        </div>
      );
    }

    // Fallback placeholder
    return (
      <div className="aspect-square w-full overflow-hidden bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No media</p>
      </div>
    );
  };

  return (
    <>
      <Card className="card-hover overflow-hidden">
        <CardHeader className="p-0">
          {renderMedia()}
        </CardHeader>
        <CardContent className="p-6">
          <CardTitle className="mb-2 text-xl">{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
          <p className="mt-4 text-2xl font-bold text-sage-600">
            KShs {product.price.toLocaleString()}
          </p>
          {product.sellerName && (
            <p className="mt-2 text-sm text-gray-600">
              Seller: {product.sellerName}
            </p>
          )}
          {product.mediaType && (
            <div className="mt-2 flex gap-1">
              {(product.mediaType === 'image' || product.mediaType === 'both') && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                  Image
                </span>
              )}
              {(product.mediaType === 'video' || product.mediaType === 'both') && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-md">
                  Video
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2 p-6 pt-0">
          <Button 
            className="flex-1 bg-sage-600 hover:bg-sage-700"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            View Details
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => onAddToCart(product)}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
          {product.sellerId && (
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(true)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
      {product.sellerId && (
        <MessageDialog
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
          productName={product.name}
          sellerId={product.sellerId}
        />
      )}
    </>
  );
};

export default ProductCard;
