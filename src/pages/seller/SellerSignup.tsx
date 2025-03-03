
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const SellerSignup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
  });

  const validateForm = (username: string, email: string, phone: string, password: string, businessName: string) => {
    const newErrors = {
      username: "",
      email: "",
      phone: "",
      password: "",
      businessName: "",
    };

    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
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

    if (!businessName) {
      newErrors.businessName = "Business name is required";
    } else if (businessName.length < 2) {
      newErrors.businessName = "Business name must be at least 2 characters";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.email && !newErrors.phone && !newErrors.password && !newErrors.businessName;
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
            const username = formData.get("username") as string;
            const email = formData.get("email") as string;
            const phone = formData.get("phone") as string;
            const password = formData.get("password") as string;
            const businessName = formData.get("businessName") as string;

            if (!validateForm(username, email, phone, password, businessName)) {
              return;
            }

            setIsLoading(true);
            try {
              // Connect to Python backend
              const response = await fetch('http://localhost:5000/api/seller/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  username, 
                  email, 
                  phone_number: phone,
                  password,
                  user_type: 'seller',
                  business_name: businessName
                }),
                credentials: 'include'
              });
              
              const data = await response.json();
              
              if (data.success) {
                toast({
                  title: "Registration successful",
                  description: "Your seller account has been created!",
                });
                
                // Redirect to login page after successful registration
                navigate('/seller/login');
              } else {
                toast({
                  title: "Registration failed",
                  description: data.message || "Please check your information and try again",
                  variant: "destructive",
                });
              }
            } catch (error) {
              toast({
                title: "Registration failed",
                description: "Could not connect to registration server",
                variant: "destructive",
              });
              console.error("Registration error:", error);
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">
                Username
              </label>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="johndoe123"
                aria-describedby="username-error"
                className={errors.username ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500" id="username-error">
                  {errors.username}
                </p>
              )}
            </div>
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
                showPasswordToggle={true}
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
