
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const validateForm = (name: string, email: string, password: string) => {
    const newErrors = {
      name: "",
      email: "",
      password: "",
    };

    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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
    return !newErrors.name && !newErrors.email && !newErrors.password;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Sign up to start shopping</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const name = formData.get("name") as string;
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;

            if (!validateForm(name, email, password)) {
              return;
            }

            setIsLoading(true);
            try {
              // Connect to Python backend
              const response = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                  username: name, 
                  email, 
                  password 
                }),
                credentials: 'include'
              });
              
              const data = await response.json();
              
              if (data.success) {
                toast({
                  title: "Registration successful",
                  description: "Your account has been created!",
                });
                
                // Redirect to login page after successful registration
                navigate('/login');
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
            } finally {
              setIsLoading(false);
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Full Name
              </label>
              <Input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                aria-describedby="name-error"
                className={errors.name ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500" id="name-error">
                  {errors.name}
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="text-sage-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
