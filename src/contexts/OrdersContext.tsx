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

  // Load orders from localStorage on initial load, then fetch from API if authenticated
  useEffect(() => {
    // First load from localStorage for immediate display
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (error) {
        console.error("Error parsing saved orders:", error);
      }
    }

    // Then fetch from API if authenticated
    if (isAuthenticated && userId) {
      fetchOrders();
    }
  }, [isAuthenticated, userId]);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log("Fetching orders for user:", userId);
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Orders API response:", data);
        if (data.success && data.orders) {
          const fetchedOrders = data.orders.map((order: any) => ({
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
          setOrders(fetchedOrders);
        }
      } else {
        console.error("Failed to fetch orders:", await response.text());
        // If API fails, keep using localStorage data
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      // If API fails, keep using localStorage data
    }
  };

  const addOrder = async (order: Order) => {
    console.log("Adding order:", order);
    
    // Add to local state immediately for better UX
    setOrders((prevOrders) => [order, ...prevOrders]);
    
    // Try to save to database if authenticated
    if (isAuthenticated && userId) {
      console.log("Attempting to save order to database:", order);
      try {
        // Format order data for backend
        const orderData = {
          order_id: order.id,
          user_id: userId,
          total: order.total,
          status: order.status,
          items: order.items.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            image_url: item.image,
            seller_id: item.sellerId || null
          }))
        };
        
        console.log("Sending order data to API:", orderData);
        
        const response = await fetch('http://localhost:5000/api/orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Order creation response:", data);
          
          if (data.success) {
            console.log("Order saved successfully to database:", data.orderId);
            // Refresh orders from the server to ensure we have the latest data
            await fetchOrders();
          } else {
            console.error("Failed to save order to database:", data.message || "Unknown error");
          }
        } else {
          const errorText = await response.text();
          console.error("HTTP error saving order:", response.status, errorText);
        }
      } catch (error) {
        console.error("Network error saving order to database:", error);
        // Order is still saved locally, so user sees it
      }
    } else {
      console.log("User not authenticated, order saved locally only");
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    console.log("Updating order status:", orderId, status);
    
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
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log("Order status updated successfully in database");
          } else {
            console.error("Failed to update order status in database:", data.message);
          }
        } else {
          console.error("HTTP error updating order status:", response.status);
        }
      } catch (error) {
        console.error("Network error updating order status:", error);
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
