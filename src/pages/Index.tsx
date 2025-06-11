
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface IndexProps {
  searchQuery: string;
  onAddToCart: (product: Product) => void;
}

const Index = ({ searchQuery, onAddToCart }: IndexProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const addToCart = (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login first",
        description: "You need to be logged in to add items to cart",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    onAddToCart(product);
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  const handleScrollToProducts = () => {
    const productsSection = document.querySelector("#products-section");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background w-full">
      <HeroSection onBrowseProducts={handleScrollToProducts} />
      
      <CategoriesSection />

      <div id="products-section" className="w-full">
        <ProductsSection searchQuery={searchQuery} onAddToCart={addToCart} />
      </div>

      {/* Features Section */}
      <section className="bg-sage-50 py-16 w-full">
        <div className="container mx-auto px-4 md:px-8 lg:px-12 xl:px-16">
          <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-wider text-sage-600">
            Why Choose Us
          </h2>
          <h3 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Platform Features
          </h3>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Verified Sellers",
                description: "All sellers are verified to ensure quality and trust",
              },
              {
                title: "Secure Transactions",
                description: "Safe and secure payment processing for all orders",
              },
              {
                title: "Quality Assurance",
                description: "Strict quality standards for all products",
              },
            ].map((feature) => (
              <Card key={feature.title} className="card-hover border-2">
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-sage-900 py-16 text-white w-full">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-sage-100">
            Join our platform today and connect with top poultry farmers and buyers
          </p>
          <Link to="/signup">
            <Button
              variant="default"
              size="lg"
              className="bg-white text-sage-900 hover:bg-sage-100"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-white py-8 w-full">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
          <p className="text-gray-600">Email: kukuhub@gmail.com</p>
          <p className="text-gray-600">Contact: 0712345678</p>
        </div>
      </section>
    </div>
  );
};

export default Index;
