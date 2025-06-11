
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { OrdersProvider } from "@/contexts/OrdersContext";
import AppRoutes from "@/routes/AppRoutes";

import "./App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <OrdersProvider>
            <div className="flex min-h-screen w-full flex-col">
              <AppRoutes />
              <Toaster />
            </div>
          </OrdersProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
