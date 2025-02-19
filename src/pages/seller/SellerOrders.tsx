
import { Button } from "@/components/ui/button";
import SellerSidebar from "@/components/seller/SellerSidebar";

const SellerOrders = () => {
  return (
    <div className="flex min-h-screen">
      <SellerSidebar />
      
      <main className="flex-1 bg-gray-50">
        <div className="border-b bg-white p-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-600">Manage your customer orders</p>
        </div>

        <div className="p-6">
          <div className="rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-500">No orders yet</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerOrders;
