import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { initiateSTKPush } from "@/utils/mpesa";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, Info, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useOrders, Order } from "@/contexts/OrdersContext";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from "uuid";

const Checkout = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [isServerConfigError, setIsServerConfigError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { isAuthenticated, userId } = useAuth();

  // Calculate total from cart
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  const createOrder = async () => {
    console.log("Creating order from cart:", cart);
    
    // Create a new order from cart items
    const orderId = uuidv4();
    
    const newOrder: Order = {
      id: orderId,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        sellerId: item.sellerId
      })),
      status: "Pending",
      date: new Date().toISOString(),
      total: cartTotal,
      userId: userId || undefined
    };

    console.log("Adding new order:", newOrder);
    
    // Add to orders context (which will handle database saving)
    await addOrder(newOrder);
    
    // Clear cart after successful order creation
    clearCart();
    
    console.log("Order created and cart cleared");
    return newOrder;
  };

  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    setIsServerConfigError(false);
    
    if (!phoneNumber || phoneNumber.length < 10) {
      setPaymentError("Please enter a valid M-Pesa phone number");
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid M-Pesa phone number",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const amount = cartTotal;
      
      toast({
        title: "Processing",
        description: "Sending payment request...",
      });
      
      const result = await initiateSTKPush(phoneNumber, amount);
      
      if (result.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa payment prompt and enter your PIN",
        });
        
        // Close dialog and reset state
        setPaymentDialogOpen(false);
        setPaymentError("");
        
        // Show processing notification
        toast({
          title: "Processing Payment",
          description: "Please wait while we confirm your payment...",
        });
        
        // Create the order immediately after payment initiation
        console.log("Creating order after payment initiation...");
        await createOrder();
        
        toast({
          title: "Order Created",
          description: "Your order has been placed successfully!",
        });
        
        // Redirect to homepage after successful order creation
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Check if it's a server configuration error
        if (result.message && (
            result.message.includes("server configuration") || 
            result.message.includes("callback") ||
            result.message.includes("CallBackURL")
        )) {
          setIsServerConfigError(true);
          
          // For development purposes, still create the order even if M-Pesa fails
          console.log("M-Pesa failed but creating order for development...");
          await createOrder();
          
          toast({
            title: "Order Created",
            description: "Your order has been placed (M-Pesa configuration issue)",
          });
          
          setTimeout(() => navigate('/'), 2000);
        } else {
          // If payment fails, show error but keep dialog open so user can try again
          setPaymentError(result.message || "Failed to initiate payment. Please try again.");
          
          toast({
            title: "Payment Failed",
            description: result.message || "Failed to initiate payment. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError("An unexpected error occurred. Please try again.");
      
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Display empty cart message if cart is empty
  if (cart.length === 0) {
    return (
      <div className="container mx-auto max-w-2xl py-16 text-center">
        <ShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-gray-600">Add some items to your cart to checkout</p>
        <Button 
          className="mt-6"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-16">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      
      <div className="mb-8 rounded-lg border p-6">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img 
                src={item.image?.startsWith('/static') ? `http://localhost:5000${item.image}` : item.image} 
                alt={item.name} 
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  KShs {item.price.toLocaleString()} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                KShs {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between border-t pt-4">
          <span className="font-bold">Total:</span>
          <span className="font-bold">KShs {cartTotal.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="rounded-lg border p-6">
        <h2 className="mb-6 text-xl font-semibold">Select Payment Method</h2>
        
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Pay with M-Pesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>M-Pesa Payment</DialogTitle>
              <DialogDescription>
                Enter your M-Pesa phone number to receive the payment prompt.
              </DialogDescription>
            </DialogHeader>
            
            {paymentError && (
              <div className={`mb-4 rounded-md p-3 text-sm ${isServerConfigError ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'}`}>
                <div className="flex items-center">
                  {isServerConfigError ? (
                    <Info className="mr-2 h-4 w-4 text-amber-500" />
                  ) : (
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  )}
                  <p>{paymentError}</p>
                </div>
                
                {isServerConfigError && (
                  <p className="mt-2 ml-6 text-xs text-amber-700">
                    Note: This appears to be a server configuration issue with M-Pesa's callback URL, not an issue with your phone number. 
                    The server needs a publicly accessible URL for callbacks, which may not be properly configured.
                  </p>
                )}
              </div>
            )}
            
            <form onSubmit={handleMpesaPayment} className="space-y-4 pt-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Enter M-Pesa Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: 07XXXXXXXX or 01XXXXXXXX (Safaricom/M-Pesa number)
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay Now"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Checkout;
