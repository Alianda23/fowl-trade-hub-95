
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";

interface ProductsSectionProps {
  searchQuery: string;
  onAddToCart: (product: any) => void;
}

const ProductsSection = ({ searchQuery, onAddToCart }: ProductsSectionProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products
    .filter((product) => 
      (selectedCategory ? product.category === selectedCategory : true) &&
      (searchQuery
        ? product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );

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
        <div className="mt-8 text-center text-gray-500">
          No products found matching your search criteria.
        </div>
      )}
    </section>
  );
};

export default ProductsSection;
