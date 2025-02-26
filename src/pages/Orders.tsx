
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";

type OrderStatus = "Pending" | "Collected" | "Dispatched" | "Cancelled";

interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  status: OrderStatus;
  date: string;
}

const Orders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  // In a real app, this would come from an API
  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: "1",
      productName: "Free Range Chicken",
      price: 850,
      quantity: 2,
      status: "Pending",
      date: "2024-04-10",
    },
    {
      id: "2",
      productName: "Broiler Chicken",
      price: 600,
      quantity: 1,
      status: "Dispatched",
      date: "2024-04-09",
    },
  ]);

  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Collected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "Dispatched":
        return <Truck className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    toast({
      title: `Order ${newStatus}`,
      description: `Order has been marked as ${newStatus}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">My Orders</h1>
        
        <div className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No orders yet
              </CardContent>
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    Order #{order.id}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`text-sm font-medium
                      ${order.status === "Collected" && "text-green-600"}
                      ${order.status === "Cancelled" && "text-red-600"}
                      ${order.status === "Dispatched" && "text-blue-600"}
                      ${order.status === "Pending" && "text-yellow-600"}
                    `}>
                      {order.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="font-medium">{order.productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {order.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: KShs {order.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Date: {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {order.status === "Pending" && (
                    <div className="flex gap-2">
                      <Button 
                        variant="default"
                        onClick={() => handleStatusChange(order.id, "Collected")}
                      >
                        Mark as Collected
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleStatusChange(order.id, "Cancelled")}
                      >
                        Cancel Order
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Contact Information</h2>
          <p className="text-gray-600">For complaints reach us via:</p>
          <p className="text-gray-600">Email: kukuhub@gmail.com</p>
          <p className="text-gray-600">Contact: 0712345678</p>
        </div>
      </div>
    </div>
  );
};

export default Orders;
