
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeroSectionProps {
  onBrowseProducts: () => void;
}

const HeroSection = ({ onBrowseProducts }: HeroSectionProps) => {
  return (
    <section className="relative h-[70vh] overflow-hidden">
      <div className="absolute inset-0 bg-sage-900/40" />
      <div className="container relative flex h-full flex-col items-center justify-center text-white">
        <p className="mb-2 animate-fadeIn text-sm font-medium uppercase tracking-wider text-sage-100">
          Welcome to
        </p>
        <h1 className="mb-6 animate-fadeIn text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          KukuHub
        </h1>
        <p className="mb-8 animate-fadeIn text-center text-lg text-sage-100 sm:text-xl">
          Connect with trusted poultry farmers and suppliers
        </p>
        <div className="flex animate-fadeIn gap-4">
          <Button
            variant="default"
            size="lg"
            className="bg-sage-600 text-white hover:bg-sage-700"
            onClick={onBrowseProducts}
          >
            Browse Products
          </Button>
          <Link to="/seller/signup">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white/10"
            >
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
