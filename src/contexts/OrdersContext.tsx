
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { CartItem } from "./CartContext";
import { useAuth } from "./AuthContext";

// Define Order interface with status types
export interface Order {
  id: string;
  products: CartItem[];
  status: "Pending" | "Processing" | "Dispatched" | "Delivered" | "Cancelled";
  date: string;
  total: number;
  sellerId?: string; // To track which seller the order belongs to
  userId?: number; // To track which user the order belongs to
}

// Define the shape of our context
interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  updateOrderStatus: (orderId: string, newStatus: Order["status"]) => void;
  getSellerOrders: (sellerId: string) => Order[];
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
}

// Create the context with a default value
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Provider component
export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const { isAuthenticated, userId } = useAuth();

  // Load orders based on authentication status
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Fetch orders from database for authenticated users
      fetchOrdersFromDatabase();
    } else {
      // Clear orders when not authenticated
      setOrders([]);
    }
  }, [isAuthenticated, userId]);

  // Fetch orders from database
  const fetchOrdersFromDatabase = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      }
    } catch (error) {
      console.error("Error fetching orders from database:", error);
    }
  };

  // Update order status and save to database
  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    // Update locally first for immediate UI feedback
    setOrders(
      orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    // Then update in database
    if (isAuthenticated) {
      try {
        await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: 'include',
        });
      } catch (error) {
        console.error("Error updating order status in database:", error);
        // Revert to previous state if API call fails
        fetchOrdersFromDatabase();
      }
    }
  };

  // Get orders for a specific seller
  const getSellerOrders = (sellerId: string) => {
    return orders.filter(order => 
      order.products.some(product => product.sellerId === sellerId)
    );
  };

  const value = {
    orders,
    setOrders,
    updateOrderStatus,
    getSellerOrders,
    showOrders,
    setShowOrders
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};

// Custom hook to use the orders context
export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
};
