
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
import { ShoppingCart, MessageSquare } from "lucide-react";
import { useState } from "react";
import MessageDialog from "./MessageDialog";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const navigate = useNavigate();
  const [showMessageDialog, setShowMessageDialog] = useState(false);

  return (
    <>
      <Card className="card-hover overflow-hidden">
        <CardHeader className="p-0">
          <div className="aspect-square w-full overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
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
          <Button
            variant="outline"
            onClick={() => setShowMessageDialog(true)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      <MessageDialog
        open={showMessageDialog}
        onOpenChange={setShowMessageDialog}
        productName={product.name}
        sellerId={product.sellerId || product.id} // Use specific sellerId if available, fallback to product.id
      />
    </>
  );
};

export default ProductCard;
