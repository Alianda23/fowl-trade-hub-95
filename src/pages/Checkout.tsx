
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();

  const handleMpesaPayment = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Payment Initiated",
      description: `M-Pesa payment request sent to ${phoneNumber}. This is a placeholder - actual payment integration will be implemented later.`,
    });
  };

  return (
    <div className="container mx-auto max-w-2xl py-16">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      
      <div className="rounded-lg border p-6">
        <h2 className="mb-6 text-xl font-semibold">Select Payment Method</h2>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Pay with M-Pesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>M-Pesa Payment</DialogTitle>
            </DialogHeader>
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
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Pay Now
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Checkout;
