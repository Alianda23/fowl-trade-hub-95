
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { products, categories } from "@/data/products";
import ProductCard from "./ProductCard";

const ProductsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <section className="container py-16">
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
          className="bg-sage-600 hover:bg-sage-700"
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;
