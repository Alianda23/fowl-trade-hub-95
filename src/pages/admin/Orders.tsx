
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Order, useOrders } from "@/contexts/OrdersContext";
import { Clock, PackageCheck, Package, PackageX, ShoppingBag, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const OrdersPage = () => {
  const { orders, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  
  useEffect(() => {
    // Apply status filter if not "All"
    const statusFilteredOrders = selectedStatus === "All" 
      ? orders 
      : orders.filter(order => order.status === selectedStatus);
    
    // Sort by date, newest first
    const sortedOrders = [...statusFilteredOrders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setFilteredOrders(sortedOrders);
  }, [orders, selectedStatus]);
  
  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
    
    toast({
      title: "Order Updated",
      description: `Order status changed to ${newStatus}`,
    });
    
    // Update selected order if it's the one being viewed
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        status: newStatus
      });
    }
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
  
  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold">All Orders</h1>
      
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
      
      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-300" />
          <h2 className="mt-2 text-xl font-medium">No orders found</h2>
          <p className="mt-1 text-gray-500">
            {selectedStatus === "All" 
              ? "There are no orders in the system yet."
              : `There are no ${selectedStatus.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                    KShs {order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge 
                      className={`flex w-fit items-center gap-1 ${getStatusColor(order.status)}`}
                      variant="outline"
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openOrderDetails(order)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Order Details Dialog */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-2xl">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Order Details #{selectedOrder.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(selectedOrder.date).toLocaleString()}
                    </p>
                  </div>
                  <Badge 
                    className={`flex w-fit items-center gap-1 ${getStatusColor(selectedOrder.status)}`}
                    variant="outline"
                  >
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </Badge>
                </div>
                
                <div className="mb-6 rounded-lg border">
                  <div className="divide-y">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex p-3">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover"
                        />
                        <div className="ml-3 flex flex-1 flex-col">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="mt-auto flex items-end justify-between">
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × KShs {item.price.toLocaleString()}
                            </p>
                            <p className="text-sm font-medium">
                              KShs {(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6 flex justify-between border-t pt-4">
                  <span className="font-medium">Total Amount:</span>
                  <span className="font-bold">
                    KShs {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="mb-2 font-medium">Update Order Status</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm"
                      variant={selectedOrder.status === "Pending" ? "default" : "outline"}
                      className={selectedOrder.status === "Pending" ? "" : "border-yellow-500 text-yellow-500 hover:bg-yellow-50"}
                      onClick={() => handleStatusChange(selectedOrder.id, "Pending")}
                    >
                      <Clock className="mr-1 h-4 w-4" />
                      Pending
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant={selectedOrder.status === "Processing" ? "default" : "outline"}
                      className={selectedOrder.status === "Processing" ? "" : "border-blue-500 text-blue-500 hover:bg-blue-50"}
                      onClick={() => handleStatusChange(selectedOrder.id, "Processing")}
                    >
                      <Package className="mr-1 h-4 w-4" />
                      Processing
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant={selectedOrder.status === "Dispatched" ? "default" : "outline"}
                      className={selectedOrder.status === "Dispatched" ? "" : "border-green-500 text-green-500 hover:bg-green-50"}
                      onClick={() => handleStatusChange(selectedOrder.id, "Dispatched")}
                    >
                      <PackageCheck className="mr-1 h-4 w-4" />
                      Dispatched
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant={selectedOrder.status === "Delivered" ? "default" : "outline"}
                      className={selectedOrder.status === "Delivered" ? "" : "border-green-600 text-green-600 hover:bg-green-50"}
                      onClick={() => handleStatusChange(selectedOrder.id, "Delivered")}
                    >
                      <ShoppingBag className="mr-1 h-4 w-4" />
                      Delivered
                    </Button>
                    
                    <Button 
                      size="sm"
                      variant={selectedOrder.status === "Cancelled" ? "default" : "outline"}
                      className={selectedOrder.status === "Cancelled" ? "" : "border-red-500 text-red-500 hover:bg-red-50"}
                      onClick={() => handleStatusChange(selectedOrder.id, "Cancelled")}
                    >
                      <PackageX className="mr-1 h-4 w-4" />
                      Cancelled
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
