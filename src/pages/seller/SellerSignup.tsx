
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const SellerSignup = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
  });

  const validateForm = (businessName: string, email: string, phone: string, password: string) => {
    const newErrors = {
      businessName: "",
      email: "",
      phone: "",
      password: "",
    };

    if (!businessName) {
      newErrors.businessName = "Business name is required";
    } else if (businessName.length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-]{10,}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.businessName && !newErrors.email && !newErrors.phone && !newErrors.password;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Seller Account</CardTitle>
          <CardDescription>Start selling on KukuHub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const businessName = formData.get("businessName") as string;
            const email = formData.get("email") as string;
            const phone = formData.get("phone") as string;
            const password = formData.get("password") as string;

            if (!validateForm(businessName, email, phone, password)) {
              return;
            }

            setIsLoading(true);
            try {
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              toast({
                title: "Signup not implemented",
                description: "This is a demo version. Authentication requires backend integration.",
              });
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="mb-2 block text-sm font-medium">
                Business Name
              </label>
              <Input
                type="text"
                id="businessName"
                name="businessName"
                placeholder="Your Business Name"
                aria-describedby="businessName-error"
                className={errors.businessName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.businessName && (
                <p className="mt-1 text-sm text-red-500" id="businessName-error">
                  {errors.businessName}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                aria-describedby="email-error"
                className={errors.email ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <Input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+254 XXX XXX XXX"
                aria-describedby="phone-error"
                className={errors.phone ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500" id="phone-error">
                  {errors.phone}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <Input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                aria-describedby="password-error"
                className={errors.password ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500" id="password-error">
                  {errors.password}
                </p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-sage-600 hover:bg-sage-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating seller account...
                </>
              ) : (
                "Create Seller Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have a seller account? </span>
            <Link to="/seller/login" className="text-sage-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerSignup;
