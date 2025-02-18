
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Login = () => {
  const { toast } = useToast();

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Please sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            toast({
              title: "Login not implemented",
              description: "This is a demo version. Authentication requires backend integration.",
            });
          }} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-sage-600 hover:bg-sage-700">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="text-sage-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
