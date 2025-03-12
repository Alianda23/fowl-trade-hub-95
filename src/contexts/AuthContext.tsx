
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

// Define the shape of our context
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  userEmail: string;
  setUserEmail: React.Dispatch<React.SetStateAction<string>>;
  handleLogout: () => void;
  // Add seller and admin authentication states
  isSellerAuthenticated: boolean;
  isAdminAuthenticated: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check localStorage for auth state on initial render
  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    const sellerAuthStatus = localStorage.getItem('isSellerAuthenticated') === 'true';
    const adminAuthStatus = localStorage.getItem('isAdminAuthenticated') === 'true';
    
    setIsAuthenticated(authStatus);
    setUserEmail(email);
    setIsSellerAuthenticated(sellerAuthStatus);
    setIsAdminAuthenticated(adminAuthStatus);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail("");
    setIsSellerAuthenticated(false);
    setIsAdminAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isSellerAuthenticated');
    localStorage.removeItem('isAdminAuthenticated');
    localStorage.removeItem('sellerId');
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('adminDepartment');
    localStorage.removeItem('sellerEmail');
  };

  const value = {
    isAuthenticated,
    setIsAuthenticated,
    userEmail,
    setUserEmail,
    handleLogout,
    isSellerAuthenticated,
    isAdminAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
