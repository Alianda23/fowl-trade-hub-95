
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const categories = [
  {
    title: "Live Poultry",
    description: "Browse quality live poultry from verified sellers",
    image: "/livepoultry.jpeg"
  },
  {
    title: "Poultry Products",
    description: "Fresh eggs, meat, and processed products",
    image: "/products.jpeg"
  },
  {
    title: "Feeds & Supplements",
    description: "High-quality feeds and nutritional supplements",
    image: "/poultryfeed.jpeg"
  },
  {
    title: "Equipment & Supplies",
    description: "Essential farming equipment and supplies",
    image: "/equipments.jpeg"
  }
];

const CategoriesSection = () => {
  return (
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
  );
};

export default CategoriesSection;
