
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { categories, products as sampleProducts } from "@/data/products";
import ProductCard from "./ProductCard";
import { Loader2 } from "lucide-react";

interface ProductsSectionProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductsSection = ({ searchQuery, onAddToCart }: ProductsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState(sampleProducts);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        
        if (data.success) {
          setProducts(data.products);
        } else {
          // Fallback to sample products if API fails
          setProducts(sampleProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        // Fallback to sample products if API fails
        setProducts(sampleProducts);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Filter products based on search query and selected category
  const filteredProducts = products
    .filter((product) => 
      (selectedCategory ? product.category === selectedCategory : true) &&
      (searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );

  if (isLoading) {
    return (
      <section id="products-section" className="container py-16">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-sage-600" />
            <p className="mt-4 text-sm text-gray-500">Loading products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products-section" className="container py-16">
      <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-wider text-sage-600">
        Our Products
      </h2>
      <h3 className="mb-8 text-center text-3xl font-bold tracking-tight">
        Browse Our Collection
      </h3>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          onClick={() => setSelectedCategory(null)}
          className={selectedCategory === null ? "bg-sage-600 hover:bg-sage-700" : ""}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-sage-600 hover:bg-sage-700" : ""}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="mb-2 text-lg font-semibold text-gray-900">No products found</p>
          <p className="text-sm text-gray-500">
            {searchQuery 
              ? `No products match "${searchQuery}". Try a different search term.`
              : selectedCategory 
                ? `No products found in the "${selectedCategory}" category.`
                : "No products available at the moment."
            }
          </p>
          {(searchQuery || selectedCategory) && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSelectedCategory(null);
                // We can't reset searchQuery here as it's controlled by the parent
              }}
            >
              Reset filters
            </Button>
          )}
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
