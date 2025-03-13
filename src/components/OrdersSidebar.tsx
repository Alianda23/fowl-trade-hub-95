
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Clock, PackageCheck, Package, PackageX, ShoppingBag } from "lucide-react";
import { Order } from "@/contexts/OrdersContext";

interface OrdersSidebarProps {
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  orders: Order[];
}

const OrdersSidebar = ({
  showOrders,
  setShowOrders,
  orders,
}: OrdersSidebarProps) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "Processing":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "Dispatched":
        return <PackageCheck className="h-4 w-4 text-green-500" />;
      case "Delivered":
        return <ShoppingBag className="h-4 w-4 text-green-600" />;
      case "Cancelled":
        return <PackageX className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Dispatched":
        return "bg-green-100 text-green-800";
      case "Delivered":
        return "bg-green-200 text-green-900";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fix image URL if it starts with /static
  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('/static')) {
      return `http://localhost:5000${imagePath}`;
    }
    return imagePath;
  };

  return (
    <div className={`fixed right-0 top-0 z-50 h-full w-96 transform bg-white p-6 shadow-lg transition-transform duration-300 ${showOrders ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Your Orders</h2>
          <Button variant="ghost" onClick={() => setShowOrders(false)}>×</Button>
        </div>
        
        {orders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
            <p className="mt-4 text-gray-500">You haven't placed any orders yet</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setShowOrders(false);
                navigate('/');
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex-1 space-y-6 overflow-auto py-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Order #{order.id.slice(0, 8)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="mb-3 flex items-center">
                  <span className="mr-2 text-sm font-medium">Status:</span>
                  <Badge 
                    className={`flex items-center gap-1 ${getStatusColor(order.status)}`}
                    variant="outline"
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {order.products.map((product) => (
                    <div key={product.id} className="flex gap-3">
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name} 
                        className="h-16 w-16 rounded-md object-cover" 
                      />
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-medium">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-600">
                            Qty: {product.quantity}
                          </p>
                          <p className="text-sm font-medium">
                            KShs {product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">
                    KShs {order.total.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersSidebar;
