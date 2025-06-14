
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Users, Package, ShoppingCart, TrendingUp, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);

  const downloadReport = async (reportType: string, reportName: string) => {
    try {
      setDownloadingReport(reportType);
      
      const response = await fetch(`http://localhost:5000/api/admin/reports/${reportType}/download`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Get filename from response headers or create default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Report Downloaded",
        description: `${reportName} has been downloaded successfully`,
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadingReport(null);
    }
  };

  const reports = [
    {
      id: 'users',
      title: 'Users Report',
      description: 'Complete list of all buyers and sellers with their details',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'products',
      title: 'Products Report',
      description: 'All products with details, pricing, and seller information',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'orders',
      title: 'Orders Report',
      description: 'Complete order history with customer and status details',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'sellers',
      title: 'Sellers Report',
      description: 'Seller profiles with business details and approval status',
      icon: Store,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'sales',
      title: 'Sales Report',
      description: 'Detailed sales transactions with product and seller breakdown',
      icon: TrendingUp,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate("/admin")}>
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold">System Reports</h1>
          <p className="text-gray-600">Download comprehensive system reports in CSV format</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          const isDownloading = downloadingReport === report.id;
          
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => downloadReport(report.id, report.title)}
                  disabled={isDownloading}
                  className="w-full"
                >
                  {isDownloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download CSV
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Report Information</CardTitle>
          <CardDescription>Details about the available reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">Report Contents:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Users Report:</strong> User ID, Username, Email, Phone, Registration Date, User Type</li>
                <li><strong>Products Report:</strong> Product ID, Name, Category, Price, Stock, Seller, Created Date</li>
                <li><strong>Orders Report:</strong> Order ID, Customer, Email, Total Amount, Status, Date, Items Count</li>
                <li><strong>Sellers Report:</strong> Seller ID, Username, Business Name, Email, Status, Products Count</li>
                <li><strong>Sales Report:</strong> Order ID, Product, Seller, Quantity, Unit Price, Total, Date, Status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2">File Format:</h4>
              <p className="text-sm text-gray-600">
                All reports are generated in CSV format and can be opened in Excel, Google Sheets, or any spreadsheet application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
