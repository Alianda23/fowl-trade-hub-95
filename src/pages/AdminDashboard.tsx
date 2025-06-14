import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Users, Package, ShoppingCart, ArrowLeft, User, BarChart3, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  total_users: number;
  total_products: number;
  total_orders: number;
}

interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    total_users: 0,
    total_products: 0,
    total_orders: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is authenticated in localStorage
        const storedAuth = localStorage.getItem('isAdminAuthenticated');
        const storedEmail = localStorage.getItem('adminEmail');
        
        if (storedAuth === 'true' && storedEmail) {
          // Verify with backend
          const response = await fetch('http://localhost:5000/api/admin/check-auth', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include'
          });
          
          const data = await response.json();
          console.log("Admin auth check response:", data);
          
          if (data.isAuthenticated) {
            setIsAuthenticated(true);
            setAdminEmail(storedEmail);
          } else {
            // If backend says not authenticated, clear localStorage and redirect to login
            localStorage.removeItem('isAdminAuthenticated');
            localStorage.removeItem('adminEmail');
            setIsLoading(false);
            navigate('/admin/login');
          }
        } else {
          setIsLoading(false);
          // If no authentication in localStorage, redirect to login
          navigate('/admin/login');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear localStorage
      localStorage.removeItem('isAdminAuthenticated');
      localStorage.removeItem('adminEmail');
      
      setIsAuthenticated(false);
      setAdminEmail(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      
      navigate('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log("Dashboard stats response:", data);
        
        if (data.success) {
          setStats(data.stats);
          setRecentActivities(data.recent_activities || []);
        } else {
          console.error("Failed to fetch dashboard stats:", data.error);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Less than 1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage platform operations</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Button 
                  variant="ghost" 
                  className="gap-2"
                  onClick={() => navigate('/admin/profile')}
                >
                  <User className="h-5 w-5" />
                  Profile
                </Button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{adminEmail}</span>
                  <Button variant="ghost" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button
                className="bg-sage-600 hover:bg-sage-700"
                onClick={() => navigate('/admin/login')}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Total Users</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? "Loading..." : stats.total_users.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="bg-sage-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-sage-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Total Products</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? "Loading..." : stats.total_products.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-600">Total Orders</h3>
                <p className="text-2xl font-bold">
                  {statsLoading ? "Loading..." : stats.total_orders.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Manage Users</h3>
                <p className="text-gray-600">View and manage user accounts</p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/users')}
            >
              View Users
            </Button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-sage-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-sage-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Manage Products</h3>
                <p className="text-gray-600">Review and moderate products</p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/products')}
            >
              View Products
            </Button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Manage Orders</h3>
                <p className="text-gray-600">Track and manage orders</p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/orders')}
            >
              View Orders
            </Button>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Download Reports</h3>
                <p className="text-gray-600">Generate and download CSV reports</p>
              </div>
            </div>
            <Button 
              className="w-full"
              onClick={() => navigate('/admin/reports')}
            >
              Generate Reports
            </Button>
          </div>

          <div className="bg-white rounded-lg border p-6 md:col-span-2">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-gray-600">Latest platform activities</p>
              </div>
            </div>
            <div className="space-y-3">
              {statsLoading ? (
                <div className="text-center text-gray-500">Loading activities...</div>
              ) : recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">{activity.description}</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No recent activities</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
