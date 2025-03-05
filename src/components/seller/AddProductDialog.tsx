
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { categories, productTypes } from "@/data/products";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded?: () => void;
}

const AddProductDialog = ({ open, onOpenChange, onProductAdded }: AddProductDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    type: productTypes[categories[0] as keyof typeof productTypes][0],
    price: '',
    stock: '',
    image: null as File | null
  });

  useEffect(() => {
    // Check authentication when dialog opens
    if (open) {
      const checkAuth = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/seller/check-auth', {
            method: 'GET',
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (!data.isAuthenticated) {
            toast({
              title: "Authentication Required",
              description: "Please sign in to add products",
              variant: "destructive",
            });
            onOpenChange(false);
            navigate('/seller/login');
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Auth check error:", error);
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          onOpenChange(false);
        }
      };
      
      checkAuth();
    }
  }, [open, onOpenChange, toast, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update type options when category changes
    if (name === 'category') {
      setSelectedCategory(value);
      setFormData(prev => ({
        ...prev,
        type: productTypes[value as keyof typeof productTypes][0]
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add products",
        variant: "destructive",
      });
      onOpenChange(false);
      return;
    }

    if (!formData.image) {
      toast({
        title: "Image Required",
        description: "Please select a product image",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for multipart/form-data (for image upload)
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description);
      productFormData.append('category', formData.category);
      productFormData.append('type', formData.type);
      productFormData.append('price', formData.price);
      productFormData.append('stock', formData.stock);
      if (formData.image) {
        productFormData.append('image', formData.image);
      }
      
      // Send to backend API
      const response = await fetch('http://localhost:5000/api/products/create', {
        method: 'POST',
        body: productFormData,
        credentials: 'include' // Include cookies for auth
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Product Added",
          description: "The product has been added to your inventory.",
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: categories[0],
          type: productTypes[categories[0] as keyof typeof productTypes][0],
          price: '',
          stock: '',
          image: null
        });
        
        // Close dialog
        onOpenChange(false);
        
        // Callback to refresh products
        if (onProductAdded) {
          onProductAdded();
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add product",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium">Product Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-md border p-2" 
              required 
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border p-2" 
              rows={3} 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select 
                className="w-full rounded-md border p-2" 
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Type</label>
              <select 
                className="w-full rounded-md border p-2" 
                required
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                {productTypes[selectedCategory as keyof typeof productTypes].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Price (KShs)</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full rounded-md border p-2" 
                required 
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Stock</label>
              <input 
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full rounded-md border p-2" 
                required 
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Product Image</label>
            <input 
              type="file" 
              accept="image/*" 
              className="w-full rounded-md border p-2" 
              onChange={handleFileChange}
              required 
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-sage-600 hover:bg-sage-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Product...' : 'Add Product'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
