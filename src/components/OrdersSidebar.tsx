
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Product } from "@/data/products";

interface Order {
  id: string;
  products: (Product & { quantity: number })[];
  status: string;
  date: string;
  total: number;
}

interface OrdersSidebarProps {
  showOrders: boolean;
  setShowOrders: (show: boolean) => void;
  orders: Order[];
}

const OrdersSidebar = ({
  showOrders,
  setShowOrders,
  orders,
}: OrdersSidebarProps) => {
  const navigate = useNavigate();

  return (
    <div className={`fixed right-0 top-0 z-50 h-full w-96 transform bg-white p-6 shadow-lg transition-transform duration-300 ${showOrders ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex h-full flex-col">
        <div className="flex justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Your Orders</h2>
          <Button variant="ghost" onClick={() => setShowOrders(false)}>×</Button>
        </div>
        
        {orders.length === 0 ? (
          <p className="mt-4 text-gray-500">You haven't placed any orders yet</p>
        ) : (
          <div className="flex-1 space-y-4 overflow-auto">
            {orders.map((order) => (
              <div key={order.id} className="border-b pb-4">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm text-gray-600">Order #{order.id}</span>
                  <span className="text-sm text-gray-600">{order.date}</span>
                </div>
                <div className="space-y-2">
                  {order.products.map((product) => (
                    <div key={product.id} className="flex gap-4">
                      <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                        <p className="text-sm">KShs {product.price.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="font-semibold">Status:</span>
                  <span className="text-sage-600">{order.status}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span>KShs {order.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersSidebar;
