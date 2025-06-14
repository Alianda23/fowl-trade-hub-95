
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { FileText, Download, TrendingUp, Users, Package, ShoppingCart, MessageSquare, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  salesReport: {
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    monthlySales: Array<{ month: string; sales: number; orders: number }>;
  };
  userReport: {
    totalUsers: number;
    totalSellers: number;
    newUsersThisMonth: number;
    userGrowth: Array<{ month: string; users: number; sellers: number }>;
  };
  productReport: {
    totalProducts: number;
    topCategories: Array<{ category: string; count: number; percentage: number }>;
    lowStockProducts: Array<{ name: string; stock: number; category: string }>;
  };
  sellerReport: {
    activeSellers: number;
    pendingSellers: number;
    topSellers: Array<{ name: string; sales: number; products: number }>;
  };
  systemReport: {
    totalMessages: number;
    unreadMessages: number;
    systemUptime: string;
    storageUsed: string;
    recentActivity: Array<{ action: string; timestamp: string; user: string }>;
  };
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sales");
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      console.log("Fetching real-time report data from Flask backend...");
      
      // Fetch all report data from your Flask backend
      const response = await fetch('http://localhost:5000/api/admin/reports', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Report data received:", data);
      
      if (data.success) {
        setReportData(data.reports);
      } else {
        throw new Error(data.message || 'Failed to fetch report data');
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error fetching reports",
        description: "Could not load real-time data from server. Please check your Flask backend.",
        variant: "destructive",
      });
      
      // Fallback to show error state instead of mock data
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      console.log(`Exporting ${reportType} report...`);
      
      const response = await fetch(`http://localhost:5000/api/admin/reports/export/${reportType}`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Export successful",
          description: `${reportType} report has been downloaded.`,
        });
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 mx-auto mb-4"></div>
          <p>Loading real-time reports from server...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Failed to load report data</h1>
          <p className="text-gray-600 mb-4">Could not connect to Flask backend server.</p>
          <Button onClick={fetchReportData} className="bg-sage-600 hover:bg-sage-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Reports</h1>
          <p className="text-gray-600">Real-time analytics and reporting dashboard</p>
        </div>
        <Button onClick={fetchReportData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sales
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Sellers
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Sales Analytics</h2>
            <Button onClick={() => handleExportReport('sales')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Sales</CardTitle>
                <CardDescription>Revenue generated</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-sage-600">
                  KShs {reportData.salesReport.totalSales.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Orders</CardTitle>
                <CardDescription>Orders processed</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.salesReport.totalOrders}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
                <CardDescription>Per order revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  KShs {reportData.salesReport.avgOrderValue}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Trend</CardTitle>
              <CardDescription>Sales and orders over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  sales: { label: "Sales", color: "#10b981" },
                  orders: { label: "Orders", color: "#3b82f6" }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.salesReport.monthlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="#10b981" />
                    <Bar dataKey="orders" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Report */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">User Analytics</h2>
            <Button onClick={() => handleExportReport('users')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Registered buyers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">
                  {reportData.userReport.totalUsers}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Total Sellers</CardTitle>
                <CardDescription>Active sellers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-sage-600">
                  {reportData.userReport.totalSellers}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>New Users</CardTitle>
                <CardDescription>This month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {reportData.userReport.newUsersThisMonth}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
              <CardDescription>User and seller growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  users: { label: "Users", color: "#3b82f6" },
                  sellers: { label: "Sellers", color: "#10b981" }
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.userReport.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="sellers" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Report */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Product Analytics</h2>
            <Button onClick={() => handleExportReport('products')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Categories Distribution</CardTitle>
                <CardDescription>Products by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    products: { label: "Products" }
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.productReport.topCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        label={(entry) => `${entry.category}: ${entry.percentage}%`}
                      >
                        {reportData.productReport.topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alert</CardTitle>
                <CardDescription>Products running low on inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {reportData.productReport.lowStockProducts.map((product, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                          {product.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Total Products</CardTitle>
              <CardDescription>Products available on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-sage-600">
                {reportData.productReport.totalProducts}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sellers Report */}
        <TabsContent value="sellers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Seller Analytics</h2>
            <Button onClick={() => handleExportReport('sellers')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sellers</CardTitle>
                <CardDescription>Approved and selling</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {reportData.sellerReport.activeSellers}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>Awaiting verification</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-600">
                  {reportData.sellerReport.pendingSellers}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Sellers</CardTitle>
              <CardDescription>Based on sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {reportData.sellerReport.topSellers.map((seller, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-sage-50 rounded-lg">
                      <div>
                        <p className="font-medium">{seller.name}</p>
                        <p className="text-sm text-gray-600">{seller.products} products</p>
                      </div>
                      <span className="text-sage-800 font-medium">
                        KShs {seller.sales.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Report */}
        <TabsContent value="system" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">System Analytics</h2>
            <Button onClick={() => handleExportReport('system')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Platform communication</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Messages</span>
                    <span className="font-bold">{reportData.systemReport.totalMessages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unread Messages</span>
                    <span className="font-bold text-red-600">{reportData.systemReport.unreadMessages}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Platform performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Uptime</span>
                    <span className="font-bold text-green-600">{reportData.systemReport.systemUptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage Used</span>
                    <span className="font-bold">{reportData.systemReport.storageUsed}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {reportData.systemReport.recentActivity?.map((activity, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-600">by {activity.user}</p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </span>
                    </div>
                  )) || (
                    <div className="text-center text-gray-500 py-8">
                      No recent activity data available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
