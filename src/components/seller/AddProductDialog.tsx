
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'both'>('image');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: categories[0],
    type: productTypes[categories[0] as keyof typeof productTypes][0],
    price: '',
    stock: '',
    image: null as File | null,
    video: null as File | null
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
    const inputName = e.target.name;
    
    if (inputName === 'image') {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    } else if (inputName === 'video') {
      setFormData(prev => ({
        ...prev,
        video: file
      }));
    }
  };

  const handleMediaTypeChange = (type: 'image' | 'video' | 'both') => {
    setMediaType(type);
    // Reset files when changing media type
    if (type === 'image') {
      setFormData(prev => ({ ...prev, video: null }));
    } else if (type === 'video') {
      setFormData(prev => ({ ...prev, image: null }));
    }
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

    // Validate media files based on selected type
    if (mediaType === 'image' && !formData.image) {
      toast({
        title: "Image Required",
        description: "Please select a product image",
        variant: "destructive",
      });
      return;
    }
    
    if (mediaType === 'video' && !formData.video) {
      toast({
        title: "Video Required",
        description: "Please select a product video",
        variant: "destructive",
      });
      return;
    }
    
    if (mediaType === 'both' && (!formData.image || !formData.video)) {
      toast({
        title: "Both Image and Video Required",
        description: "Please select both an image and a video",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData for multipart/form-data (for file uploads)
      const productFormData = new FormData();
      productFormData.append('name', formData.name);
      productFormData.append('description', formData.description);
      productFormData.append('category', formData.category);
      productFormData.append('type', formData.type);
      productFormData.append('price', formData.price);
      productFormData.append('stock', formData.stock);
      productFormData.append('media_type', mediaType);
      
      if (formData.image) {
        productFormData.append('image', formData.image);
      }
      if (formData.video) {
        productFormData.append('video', formData.video);
      }
      
      const response = await fetch('http://localhost:5000/api/products/create', {
        method: 'POST',
        body: productFormData,
        credentials: 'include'
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
          image: null,
          video: null
        });
        setMediaType('image');
        
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new product to your inventory
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
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
            
            {/* Media Type Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium">Media Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange('image')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    mediaType === 'image' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Image Only
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange('video')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    mediaType === 'video' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Video Only
                </button>
                <button
                  type="button"
                  onClick={() => handleMediaTypeChange('both')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    mediaType === 'both' 
                      ? 'bg-sage-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Conditional Media Upload Fields */}
            {(mediaType === 'image' || mediaType === 'both') && (
              <div>
                <label className="mb-2 block text-sm font-medium">Product Image</label>
                <input 
                  type="file" 
                  name="image"
                  accept="image/*" 
                  className="w-full rounded-md border p-2" 
                  onChange={handleFileChange}
                  required={mediaType === 'image'}
                />
              </div>
            )}
            
            {(mediaType === 'video' || mediaType === 'both') && (
              <div>
                <label className="mb-2 block text-sm font-medium">Product Video</label>
                <input 
                  type="file" 
                  name="video"
                  accept="video/*" 
                  className="w-full rounded-md border p-2" 
                  onChange={handleFileChange}
                  required={mediaType === 'video'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: MP4, WebM, AVI (max 50MB)
                </p>
              </div>
            )}
            
            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-sage-600 hover:bg-sage-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Product...' : 'Add Product'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductDialog;
