import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { CartItem } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  sellerId?: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: "Pending" | "Processing" | "Dispatched" | "Delivered" | "Cancelled";
  items: OrderItem[];
  userId?: number;
}

interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  addOrder: (order: Order) => Promise<void>;
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  fetchOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const { isAuthenticated, userId } = useAuth();

  // Load orders from API when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchOrders();
    }
  }, [isAuthenticated, userId]);

  const fetchOrders = async () => {
    if (!isAuthenticated || !userId) {
      console.log("User not authenticated, skipping order fetch");
      return;
    }
    
    try {
      console.log("Fetching orders for user:", userId);
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log("Orders fetch response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Orders fetch response data:", data);
        
        if (data.success && data.orders) {
          const mappedOrders = data.orders.map((order: any) => ({
            id: order.order_id,
            date: order.created_at,
            total: order.total,
            status: order.status,
            items: order.items.map((item: any) => ({
              id: String(item.product_id),
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image_url || '',
              sellerId: String(item.seller_id)
            })),
            userId: order.user_id
          }));
          
          console.log("Mapped orders:", mappedOrders);
          setOrders(mappedOrders);
        } else {
          console.log("No orders found in response or unsuccessful response");
          setOrders([]);
        }
      } else {
        console.error("Failed to fetch orders, status:", response.status);
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const addOrder = async (order: Order) => {
    console.log("=== Adding Order ===");
    console.log("Order to add:", order);
    console.log("Is authenticated:", isAuthenticated);
    console.log("User ID:", userId);
    
    // Add to local state immediately for better UX
    setOrders((prevOrders) => {
      console.log("Previous orders:", prevOrders);
      const newOrders = [order, ...prevOrders];
      console.log("New orders array:", newOrders);
      return newOrders;
    });
    
    // Save to database
    if (isAuthenticated && userId) {
      try {
        // Format order data for backend
        const orderData = {
          order_id: order.id,
          user_id: userId,
          total: order.total,
          status: order.status,
          items: order.items.map(item => ({
            product_id: parseInt(item.id),
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            image_url: item.image,
            seller_id: item.sellerId ? parseInt(item.sellerId) : null
          }))
        };
        
        console.log("Sending order data to backend:", orderData);
        
        const response = await fetch('http://localhost:5000/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });
        
        console.log("Order creation response status:", response.status);
        const data = await response.json();
        console.log("Order creation response data:", data);
        
        if (!data.success) {
          console.error("Failed to save order to database:", data.message);
          // Don't remove from local state, keep it there as fallback
        } else {
          console.log("Order saved successfully to database:", data.orderId);
          // Refresh orders from database to ensure consistency
          await fetchOrders();
        }
      } catch (error) {
        console.error("Error saving order to database:", error);
        // Don't remove from local state, keep it there as fallback
      }
    } else {
      console.log("User not authenticated, order only stored locally");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    console.log("Updating order status:", orderId, "to", status);
    
    // Update local state immediately
    setOrders((prevOrders) => 
      prevOrders.map((order) => 
        order.id === orderId ? { ...order, status } : order
      )
    );
    
    // Update in database if authenticated
    if (isAuthenticated) {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/update-status/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
          credentials: 'include'
        });
        
        const data = await response.json();
        console.log("Order status update response:", data);
        
        if (!data.success) {
          console.error("Failed to update order status in database:", data.message);
        } else {
          console.log("Order status updated successfully in database");
        }
      } catch (error) {
        console.error("Error updating order status in database:", error);
      }
    }
  };

  return (
    <OrdersContext.Provider 
      value={{ 
        orders, 
        setOrders, 
        addOrder, 
        showOrders, 
        setShowOrders, 
        updateOrderStatus,
        fetchOrders
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
