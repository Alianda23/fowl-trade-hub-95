
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SellerSidebar from "@/components/seller/SellerSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Order, useOrders } from "@/contexts/OrdersContext";
import { Clock, PackageCheck, Package, PackageX, ShoppingBag, AlertTriangle } from "lucide-react";

const SellerOrders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  
  // Get seller ID from localStorage
  const sellerId = localStorage.getItem("sellerId");
  
  useEffect(() => {
    if (!sellerId) {
      // Redirect to seller login if not authenticated
      navigate("/seller/login");
      return;
    }
    
    // Filter orders that contain products from this seller
    const filteredOrders = orders.filter(order => 
      order.products.some(product => product.sellerId === sellerId)
    );
    
    // Apply status filter if not "All"
    const statusFilteredOrders = selectedStatus === "All" 
      ? filteredOrders 
      : filteredOrders.filter(order => order.status === selectedStatus);
    
    setSellerOrders(statusFilteredOrders);
  }, [orders, sellerId, navigate, selectedStatus]);
  
  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
    
    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}`,
    });
  };
  
  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4" />;
      case "Processing":
        return <Package className="h-4 w-4" />;
      case "Dispatched":
        return <PackageCheck className="h-4 w-4" />;
      case "Delivered":
        return <ShoppingBag className="h-4 w-4" />;
      case "Cancelled":
        return <PackageX className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
    <div className="flex min-h-screen">
      <SellerSidebar />
      
      <div className="flex-1 p-8">
        <h1 className="mb-6 text-2xl font-bold">Manage Orders</h1>
        
        <div className="mb-6 flex flex-wrap gap-2">
          <Button
            variant={selectedStatus === "All" ? "default" : "outline"}
            onClick={() => setSelectedStatus("All")}
            className="text-sm"
          >
            All
          </Button>
          <Button
            variant={selectedStatus === "Pending" ? "default" : "outline"}
            onClick={() => setSelectedStatus("Pending")}
            className="text-sm"
          >
            <Clock className="mr-1 h-4 w-4" />
            Pending
          </Button>
          <Button
            variant={selectedStatus === "Processing" ? "default" : "outline"}
            onClick={() => setSelectedStatus("Processing")}
            className="text-sm"
          >
            <Package className="mr-1 h-4 w-4" />
            Processing
          </Button>
          <Button
            variant={selectedStatus === "Dispatched" ? "default" : "outline"}
            onClick={() => setSelectedStatus("Dispatched")}
            className="text-sm"
          >
            <PackageCheck className="mr-1 h-4 w-4" />
            Dispatched
          </Button>
          <Button
            variant={selectedStatus === "Delivered" ? "default" : "outline"}
            onClick={() => setSelectedStatus("Delivered")}
            className="text-sm"
          >
            <ShoppingBag className="mr-1 h-4 w-4" />
            Delivered
          </Button>
          <Button
            variant={selectedStatus === "Cancelled" ? "default" : "outline"}
            onClick={() => setSelectedStatus("Cancelled")}
            className="text-sm"
          >
            <PackageX className="mr-1 h-4 w-4" />
            Cancelled
          </Button>
        </div>
        
        {sellerOrders.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
            <h2 className="mt-2 text-xl font-medium">No orders found</h2>
            <p className="mt-1 text-gray-500">
              {selectedStatus === "All" 
                ? "You don't have any orders yet."
                : `You don't have any ${selectedStatus.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {sellerOrders.map(order => {
              // Filter only this seller's products from the order
              const sellerProducts = order.products.filter(
                product => product.sellerId === sellerId
              );
              
              // Calculate total for only this seller's products
              const sellerTotal = sellerProducts.reduce(
                (total, product) => total + product.price * product.quantity, 
                0
              );
              
              return (
                <div key={order.id} className="rounded-lg border p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleString()}
                      </p>
                    </div>
                    <Badge 
                      className={`flex items-center gap-1 ${getStatusColor(order.status)}`}
                      variant="outline"
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </div>
                  
                  <div className="mb-4 space-y-4">
                    {sellerProducts.map(product => (
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
                  
                  <div className="mb-4 flex justify-between border-t pt-3">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-bold">
                      KShs {sellerTotal.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Order Actions */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "Pending" && (
                      <>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-blue-500 text-blue-500 hover:bg-blue-50"
                          onClick={() => handleStatusChange(order.id, "Processing")}
                        >
                          <Package className="mr-1 h-4 w-4" />
                          Process
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-500 hover:bg-red-50"
                          onClick={() => handleStatusChange(order.id, "Cancelled")}
                        >
                          <PackageX className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {order.status === "Processing" && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-50"
                        onClick={() => handleStatusChange(order.id, "Dispatched")}
                      >
                        <PackageCheck className="mr-1 h-4 w-4" />
                        Dispatch
                      </Button>
                    )}
                    
                    {order.status === "Dispatched" && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => handleStatusChange(order.id, "Delivered")}
                      >
                        <ShoppingBag className="mr-1 h-4 w-4" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
