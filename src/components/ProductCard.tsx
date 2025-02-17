
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const navigate = useNavigate();

  return (
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
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button 
          className="w-full bg-sage-600 hover:bg-sage-700"
          onClick={() => navigate(`/products/${product.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
