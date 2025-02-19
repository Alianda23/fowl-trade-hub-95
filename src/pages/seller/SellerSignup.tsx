
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SellerSignup = () => {
  const { toast } = useToast();

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create Seller Account</CardTitle>
          <CardDescription>Start selling on KukuHub</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => {
            e.preventDefault();
            toast({
              title: "Signup not implemented",
              description: "This is a demo version. Authentication requires backend integration.",
            });
          }} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="mb-2 block text-sm font-medium">
                Business Name
              </label>
              <input
                type="text"
                id="businessName"
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>
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
              <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
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
              Create Seller Account
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
