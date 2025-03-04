
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Loader2, Lock, User } from "lucide-react";

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Check if already authenticated on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log("Admin auth check response:", data);
        
        if (data.isAuthenticated) {
          console.log("Admin is authenticated, redirecting to dashboard");
          navigate('/admin', { replace: true });
        } else {
          console.log("Admin is not authenticated");
        }
      } catch (error) {
        console.error("Admin auth check error:", error);
      }
    };
    
    checkAuthentication();
  }, [navigate]);

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
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async (email: string, password: string) => {
    if (!validateForm(email, password)) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Attempting admin login with:", { email, password });
      
      // Connect to Python backend
      const response = await fetch('http://localhost:5000/api/admin/login', {
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
      console.log("Admin login response:", data);
      
      if (data.success) {
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard!",
        });
        
        // Store authentication state in localStorage
        localStorage.setItem('isAdminAuthenticated', 'true');
        localStorage.setItem('adminEmail', email);
        
        if (data.admin_id) {
          localStorage.setItem('adminId', data.admin_id.toString());
        }
        
        // Force navigation to admin dashboard with replace to prevent back button issues
        console.log("Redirecting to admin dashboard...");
        setTimeout(() => {
          // Using a timeout to ensure state updates are processed
          navigate('/admin', { replace: true });
        }, 100);
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid admin credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Admin login error:", error);
      toast({
        title: "Login failed",
        description: "Could not connect to authentication server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Please sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;
            const password = formData.get("password") as string;
            
            handleLogin(email, password);
          }} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  className="pl-10"
                  placeholder="admin@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  className="pl-10"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
