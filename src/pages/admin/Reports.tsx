
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, FileText, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  salesReport: any;
  ordersReport: any;
  productsReport: any;
  usersReport: any;
  revenueReport: any;
}

export default function Reports() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData>({
    salesReport: null,
    ordersReport: null,
    productsReport: null,
    usersReport: null,
    revenueReport: null
  });
  const [dateRange, setDateRange] = useState("30"); // days

  const reports = [
    {
      id: "sales",
      title: "Sales Report",
      description: "Overview of sales performance and trends",
      icon: <FileText className="h-5 w-5" />,
      dataKey: "salesReport"
    },
    {
      id: "orders",
      title: "Orders Report",
      description: "Detailed analysis of order patterns and status",
      icon: <FileText className="h-5 w-5" />,
      dataKey: "ordersReport"
    },
    {
      id: "products",
      title: "Products Report",
      description: "Product performance and inventory analysis",
      icon: <FileText className="h-5 w-5" />,
      dataKey: "productsReport"
    },
    {
      id: "users",
      title: "Users Report",
      description: "User registration and activity metrics",
      icon: <FileText className="h-5 w-5" />,
      dataKey: "usersReport"
    },
    {
      id: "revenue",
      title: "Revenue Report",
      description: "Financial performance and revenue breakdown",
      icon: <FileText className="h-5 w-5" />,
      dataKey: "revenueReport"
    }
  ];

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports?days=${dateRange}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReportData(data.reports);
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async (reportType: string, format: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/reports/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          reportType,
          format,
          dateRange: parseInt(dateRange)
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Success",
          description: `${reportType} report downloaded successfully`,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>
        <div>
          <h2 className="text-sm font-medium text-gray-500">KukuHub Admin</h2>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5" />
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchReportData} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh Reports"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="relative">
            <CardHeader>
              <div className="flex items-center gap-2">
                {report.icon}
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => downloadReport(report.id, 'pdf')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => downloadReport(report.id, 'csv')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                
                {reportData[report.dataKey as keyof ReportData] && (
                  <div className="text-sm text-gray-600">
                    <p>Data available for selected period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>
              Quick overview of key metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading summary...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {reportData.salesReport?.totalSales || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Sales</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {reportData.ordersReport?.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    KES {reportData.revenueReport?.totalRevenue || 0}
                  </p>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
