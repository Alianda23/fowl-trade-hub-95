
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/data/products";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="container min-h-screen py-8">
      <Button
        variant="ghost"
        className="mb-6"
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
          <Button
            size="lg"
            className="mt-6 w-full bg-sage-600 hover:bg-sage-700"
            onClick={() => {
              toast({
                title: "Added to cart",
                description: `${product.name} has been added to your cart`,
              });
            }}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
