
import { Button } from "@/components/ui/button";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Truck, XCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Order {
  id: string;
  customerName: string;
  product: string;
  quantity: number;
  total: number;
  status: 'pending' | 'dispatched' | 'cancelled' | 'collected';
  date: string;
}

const SellerOrders = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // This would typically come from your backend
  const orders: Order[] = [
    {
      id: "1",
      customerName: "John Doe",
      product: "Day-old Chicks",
      quantity: 50,
      total: 5000,
      status: 'pending',
      date: "2024-02-20"
    }
  ];

  const handleDispatch = (orderId: string) => {
    // Here you would update the order status in your backend
    toast({
      title: "Order Dispatched",
      description: `Order #${orderId} has been marked as dispatched.`,
    });
  };

  const handleCancel = (orderId: string) => {
    // Here you would update the order status in your backend
    toast({
      title: "Order Cancelled",
      description: `Order #${orderId} has been cancelled.`,
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      dispatched: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
      collected: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant="outline" className={statusStyles[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      
      <main className="flex-1 bg-gray-50">
        <div className="border-b bg-white p-6">
          <div className="mb-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/seller")}>
              <ArrowLeft className="h-5 w-5" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Orders</h1>
          </div>
          <p className="text-sm text-gray-600">Manage your customer orders</p>
        </div>

        <div className="p-6">
          {orders.length === 0 ? (
            <div className="rounded-lg border bg-white p-8 text-center">
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.product}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>KES {order.total.toLocaleString()}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {order.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1"
                                onClick={() => handleDispatch(order.id)}
                              >
                                <Truck className="h-4 w-4" />
                                Dispatch
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-red-600 hover:bg-red-50"
                                onClick={() => handleCancel(order.id)}
                              >
                                <XCircle className="h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SellerOrders;
