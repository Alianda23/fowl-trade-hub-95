
import { Button } from "@/components/ui/button";
import { Product } from "@/data/products";
import { useNavigate } from "react-router-dom";

interface CartItem extends Product {
  quantity: number;
}

interface CartSidebarProps {
  showCart: boolean;
  setShowCart: (show: boolean) => void;
  cart: CartItem[];
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
}

const CartSidebar = ({
  showCart,
  setShowCart,
  cart,
  updateQuantity,
  removeFromCart,
}: CartSidebarProps) => {
  const navigate = useNavigate();
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    // Store cart info in sessionStorage for checkout page
    sessionStorage.setItem('cartTotal', cartTotal.toString());
    sessionStorage.setItem('cartItems', JSON.stringify(cart));
    
    setShowCart(false);
    navigate('/checkout');
  };
  
  // Fix image URL if it starts with /static
  const getImageUrl = (imagePath: string) => {
    if (imagePath?.startsWith('/static')) {
      return `http://localhost:5000${imagePath}`;
    }
    return imagePath;
  };

  return (
    <div className={`fixed right-0 top-0 z-50 h-full w-96 transform bg-white p-6 shadow-lg transition-transform duration-300 ${showCart ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Shopping Cart</h2>
          <Button variant="ghost" onClick={() => setShowCart(false)}>×</Button>
        </div>
        
        {cart.length === 0 ? (
          <p className="mt-4 text-gray-500">Your cart is empty</p>
        ) : (
          <>
            <div className="mb-4 mt-4 flex justify-between border-b pb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold">KShs {cartTotal.toLocaleString()}</span>
            </div>
            <Button 
              className="mb-4 w-full bg-sage-600 hover:bg-sage-700 text-white font-bold"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
            <div className="flex-1 space-y-4 overflow-auto">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 border-b pb-4">
                  <img src={getImageUrl(item.image)} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">KShs {item.price.toLocaleString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >-</Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >+</Button>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >×</Button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartSidebar;
