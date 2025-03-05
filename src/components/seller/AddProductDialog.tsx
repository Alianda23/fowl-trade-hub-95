
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
}

const AddProductDialog = ({ open, onOpenChange }: AddProductDialogProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => {
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
          
          onOpenChange(false);
          toast({
            title: "Product Added",
            description: "The product has been added to your inventory.",
          });
        }}>
          <div>
            <label className="mb-2 block text-sm font-medium">Product Name</label>
            <input type="text" className="w-full rounded-md border p-2" required />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea className="w-full rounded-md border p-2" rows={3} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <select 
                className="w-full rounded-md border p-2" 
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
              <select className="w-full rounded-md border p-2" required>
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
              <input type="number" className="w-full rounded-md border p-2" required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Stock</label>
              <input type="number" className="w-full rounded-md border p-2" required />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Product Image</label>
            <input type="file" accept="image/*" className="w-full rounded-md border p-2" required />
          </div>
          <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700">
            Add Product
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
