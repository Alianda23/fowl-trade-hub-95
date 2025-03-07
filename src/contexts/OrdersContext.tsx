
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";
import { CartItem } from "./CartContext";

// Define Order interface
export interface Order {
  id: string;
  products: CartItem[];
  status: string;
  date: string;
  total: number;
}

// Define the shape of our context
interface OrdersContextType {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
}

// Create the context with a default value
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Provider component
export const OrdersProvider = ({ children }: { children: ReactNode }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  // Load orders from localStorage on initial render
  useEffect(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(parsedOrders);
      } catch (e) {
        console.error("Error parsing orders from localStorage", e);
      }
    }
  }, []);

  // Save orders to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const value = {
    orders,
    setOrders,
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
