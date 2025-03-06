
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Pencil, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductListProps {
  products: Product[];
  onRefresh?: () => void;
}

const ProductList = ({ products, onRefresh }: ProductListProps) => {
  const { toast } = useToast();
  
  // Fix image URL if it starts with /static
  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('/static')) {
      return `http://localhost:5000${imagePath}`;
    }
    return imagePath;
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast({
            title: "Product Deleted",
            description: "The product has been removed from your inventory",
          });
          
          if (onRefresh) {
            onRefresh();
          }
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to delete product. Database might need updating.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Database Error",
          description: "There was a problem with the database. Please run the db_update.py script to update your database schema.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Your Products</h2>
      {products.length === 0 ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-500">No products listed yet. Add your first product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between rounded-lg border bg-white p-4">
              <div className="flex items-center gap-4">
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name}
                  className="h-16 w-16 rounded-lg object-cover" 
                />
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                  <p className="text-sm font-medium text-sage-600">KShs {product.price}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600"
                  onClick={() => handleDeleteProduct(product.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
