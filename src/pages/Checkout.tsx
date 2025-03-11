import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { initiateSTKPush } from "@/utils/mpesa";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";

const Checkout = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleMpesaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError("");
    
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
      // For demonstration purposes, we're using a fixed amount
      // In a real app, you'd calculate this from the cart items
      const amount = 1; // Minimum amount for testing
      
      toast({
        title: "Processing",
        description: "Connecting to M-Pesa...",
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
        
        // In a production app, you would poll the server to check payment status
        // For simplicity, we're simulating a successful payment after a delay
        setTimeout(() => {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully!",
          });
          
          // Redirect to homepage after successful payment
          setTimeout(() => navigate('/'), 2000);
        }, 5000);
      } else {
        // If payment fails, show error but keep dialog open so user can try again
        setPaymentError(result.message || "Failed to initiate payment. Please try again.");
        
        toast({
          title: "Payment Failed",
          description: result.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
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

  return (
    <div className="container mx-auto max-w-2xl py-16">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      
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
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  <p>{paymentError}</p>
                </div>
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
