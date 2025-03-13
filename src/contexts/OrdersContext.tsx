
import { createContext, useState, useContext, ReactNode } from "react";
import { CartItem } from "@/contexts/CartContext";

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
  addOrder: (order: Order) => void;
  // Add missing properties
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  const addOrder = (order: Order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prevOrders) => 
      prevOrders.map((order) => 
        order.id === orderId ? { ...order, status } : order
      )
    );
  };

  return (
    <OrdersContext.Provider 
      value={{ 
        orders, 
        setOrders, 
        addOrder, 
        showOrders, 
        setShowOrders, 
        updateOrderStatus 
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
