
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const SellerLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = (email: string, password: string) => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Seller Login</CardTitle>
          <CardDescription>Sign in to your seller account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            if (!validateForm(email, password)) {
              return;
            }

            setIsLoading(true);
            try {
              // Connect to Python backend
              const response = await fetch('http://localhost:5000/api/seller/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  email, 
                  password
                }),
                credentials: 'include'
              });
              
              const data = await response.json();
              
              if (data.success) {
                toast({
                  title: "Login successful",
                  description: "Welcome back to your seller dashboard!",
                });
                
                // Store authentication state in localStorage
                localStorage.setItem('isSellerAuthenticated', 'true');
                localStorage.setItem('sellerEmail', email);
                
                // Redirect to seller dashboard
                navigate('/seller');
              } else {
                toast({
                  title: "Login failed",
                  description: data.message || "Invalid email or password",
                  variant: "destructive",
                });
              }
            } catch (error) {
              toast({
                title: "Login failed",
                description: "Could not connect to authentication server",
                variant: "destructive",
              });
              console.error("Login error:", error);
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4">
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
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have a seller account? </span>
            <Link to="/seller/signup" className="text-sage-600 hover:underline">
              Sign up as seller
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SellerLogin;
