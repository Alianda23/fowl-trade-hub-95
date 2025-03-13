
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";
import { useAuth } from "./AuthContext";

// Define CartItem interface
export interface CartItem extends Product {
  quantity: number;
}

// Define the shape of our context
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, newQuantity: number) => void;
  clearCart: () => void;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

// Create the context with a default value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const { isAuthenticated, userId } = useAuth();

  // Load cart from localStorage or database based on authentication status
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Fetch cart from database for authenticated users
      fetchCartFromDatabase();
    } else {
      // Load cart from localStorage for non-authenticated users
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error("Error parsing cart from localStorage", e);
        }
      }
    }
  }, [isAuthenticated, userId]);

  // Fetch cart from database
  const fetchCartFromDatabase = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/cart`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cart) {
          setCart(data.cart);
        }
      }
    } catch (error) {
      console.error("Error fetching cart from database:", error);
    }
  };

  // Save cart to database for authenticated users or localStorage for non-authenticated users
  useEffect(() => {
    if (isAuthenticated && userId) {
      // Save cart to database
      saveCartToDatabase();
    } else {
      // Save cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated, userId]);

  // Save cart to database
  const saveCartToDatabase = async () => {
    try {
      await fetch(`http://localhost:5000/api/cart/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart }),
        credentials: 'include',
      });
    } catch (error) {
      console.error("Error saving cart to database:", error);
    }
  };

  // Add item to cart
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      // Update the cart array with the new quantity for the existing item
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Update item quantity in cart
  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    showCart,
    setShowCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
