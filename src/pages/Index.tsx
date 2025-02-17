
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const categories = [
  {
    title: "Live Poultry",
    description: "Browse quality live poultry from verified sellers",
    image: "/placeholder.svg"
  },
  {
    title: "Poultry Products",
    description: "Fresh eggs, meat, and processed products",
    image: "/placeholder.svg"
  },
  {
    title: "Feeds & Supplements",
    description: "High-quality feeds and nutritional supplements",
    image: "/placeholder.svg"
  },
  {
    title: "Equipment & Supplies",
    description: "Essential farming equipment and supplies",
    image: "/placeholder.svg"
  }
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-sage-900/40" />
        <div className="container relative flex h-full flex-col items-center justify-center text-white">
          <p className="mb-2 animate-fadeIn text-sm font-medium uppercase tracking-wider text-sage-100">
            Welcome to
          </p>
          <h1 className="mb-6 animate-fadeIn text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Poultry Marketing System
          </h1>
          <p className="mb-8 animate-fadeIn text-center text-lg text-sage-100 sm:text-xl">
            Connect with trusted poultry farmers and suppliers
          </p>
          <div className="flex animate-fadeIn gap-4">
            <Button
              variant="default"
              size="lg"
              className="bg-sage-600 text-white hover:bg-sage-700"
            >
              Browse Products
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              Become a Seller
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container py-16">
        <h2 className="mb-2 text-center text-sm font-medium uppercase tracking-wider text-sage-600">
          Our Categories
        </h2>
        <h3 className="mb-12 text-center text-3xl font-bold tracking-tight">
          Explore Our Products
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Card
              key={category.title}
              className="card-hover overflow-hidden border-2 border-transparent transition-colors hover:border-sage-200"
            >
              <CardHeader className="p-0">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CardTitle className="mb-2 text-xl">{category.title}</CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-sage-50 py-16">
        <div className="container">
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
      <section className="bg-sage-900 py-16 text-white">
        <div className="container text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-sage-100">
            Join our platform today and connect with top poultry farmers and buyers
          </p>
          <Button
            variant="default"
            size="lg"
            className="bg-white text-sage-900 hover:bg-sage-100"
          >
            Create Account
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
