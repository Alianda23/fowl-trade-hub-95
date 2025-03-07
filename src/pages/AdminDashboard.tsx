
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Package2, Users, ShoppingCart, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStat {
  label: string;
  value: number;
  icon: React.ReactNode;
  route: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/check-auth', {
          method: 'GET',
          credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.isAuthenticated) {
          setIsAuthenticated(true);
          setAdminEmail(data.email);
        } else {
          // If not authenticated, redirect to login
          navigate('/admin/login');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to verify authentication status.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const stats: DashboardStat[] = [
    {
      label: "Total Products",
      value: 245,
      icon: <ShoppingCart className="h-6 w-6" />,
      route: "/admin/products",
    },
    {
      label: "Total Users",
      value: 120,
      icon: <Users className="h-6 w-6" />,
      route: "/admin/users",
    },
    {
      label: "Total Orders",
      value: 78,
      icon: <Package2 className="h-6 w-6" />,
      route: "/admin/orders",
    },
  ];

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="gap-2"
            onClick={() => navigate('/admin/profile')}
          >
            <User className="h-5 w-5" />
            {adminEmail || 'Profile'}
          </Button>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Button
            key={stat.label}
            variant="outline"
            className="flex h-auto flex-col items-center justify-center gap-2 p-8 text-center hover:bg-gray-100"
            onClick={() => navigate(stat.route)}
          >
            <div className="rounded-full bg-sage-100 p-4 text-sage-600">
              {stat.icon}
            </div>
            <div className="mt-2 text-3xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <p className="text-gray-500">No recent activity to display.</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Server Status</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Database</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>API Health</span>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
