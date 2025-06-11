
import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Product } from "@/data/products";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type CartItem = Product & { quantity: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  showCart: boolean;
  setShowCart: (show: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const { isAuthenticated, userId } = useAuth();

  // Load cart from localStorage and/or database on initial render
  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, fetch cart from database
      fetchCartFromDatabase();
    } else {
      // If not authenticated, load from localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error parsing cart from localStorage:", error);
          localStorage.removeItem("cart");
        }
      }
    }
  }, [isAuthenticated, userId]);

  // Update cartTotal whenever cart changes and save to localStorage/database
  useEffect(() => {
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartTotal(Number(total.toFixed(2)));
    
    // Save cart to localStorage for non-authenticated users
    localStorage.setItem("cart", JSON.stringify(cart));
    
    // If authenticated, save to database
    if (isAuthenticated && userId) {
      saveCartToDatabase();
    }
  }, [cart, isAuthenticated, userId]);

  const fetchCartFromDatabase = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.cart) {
          setCart(data.cart);
        }
      } else {
        console.error("Failed to fetch cart");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const saveCartToDatabase = async () => {
    if (!isAuthenticated || !userId) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/cart/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            image_url: item.image
          }))
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.error("Failed to save cart to database");
      }
    } catch (error) {
      console.error("Error saving cart to database:", error);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      
      if (existingItem) {
        // If product already in cart, increase quantity
        const updatedCart = prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        
        // Show toast notification
        toast.success(`Added another ${product.name} to cart`);
        return updatedCart;
      } else {
        // Add new product to cart
        toast.success(`${product.name} added to cart`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const itemToRemove = prevCart.find((item) => item.id === productId);
      if (itemToRemove) {
        toast.success(`${itemToRemove.name} removed from cart`);
      }
      return prevCart.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    
    // If authenticated, clear cart in database
    if (isAuthenticated && userId) {
      try {
        fetch('http://localhost:5000/api/cart/clear', {
          method: 'DELETE',
          credentials: 'include'
        });
      } catch (error) {
        console.error("Error clearing cart in database:", error);
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        showCart,
        setShowCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
