
import { useState } from "react";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Pencil, X, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface ProductListProps {
  products: Product[];
  onRefresh?: () => void;
}

const ProductList = ({ products, onRefresh }: ProductListProps) => {
  const { toast } = useToast();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Product>>({});
  
  // Fix image URL if it starts with /static
  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('/static')) {
      return `http://localhost:5000${imagePath}`;
    }
    return imagePath;
  };
  
  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price,
      stock: product.stock
    });
  };
  
  const handleCancelEdit = () => {
    setEditingProductId(null);
    setEditFormData({});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue: string | number = value;
    
    // Convert to number for price and stock
    if (name === 'price' || name === 'stock') {
      processedValue = Number(value) || 0;
    }
    
    setEditFormData(prev => ({ ...prev, [name]: processedValue }));
  };
  
  const handleSaveProduct = async (productId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Product Updated",
          description: "The product has been updated successfully",
        });
        
        setEditingProductId(null);
        setEditFormData({});
        
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    }
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
                {editingProductId === product.id ? (
                  <div className="space-y-2">
                    <div>
                      <label htmlFor="name" className="block text-xs text-gray-500">Name</label>
                      <Input
                        id="name"
                        name="name"
                        value={editFormData.name || ''}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <label htmlFor="price" className="block text-xs text-gray-500">Price</label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          value={editFormData.price || 0}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label htmlFor="stock" className="block text-xs text-gray-500">Stock</label>
                        <Input
                          id="stock"
                          name="stock"
                          type="number"
                          value={editFormData.stock || 0}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    <p className="text-sm font-medium text-sage-600">KShs {product.price}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingProductId === product.id ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleSaveProduct(product.id)}
                      className="text-green-600"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
