
import { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: number | null;
  setIsAuthenticated: (value: boolean) => void;
  setUserEmail: (email: string | null) => void;
  setUserId: (id: number | null) => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is authenticated on initial render
    const savedAuthStatus = localStorage.getItem('isAuthenticated');
    const savedUserEmail = localStorage.getItem('userEmail');
    const savedUserId = localStorage.getItem('userId');
    
    if (savedAuthStatus === 'true' && savedUserEmail) {
      setIsAuthenticated(true);
      setUserEmail(savedUserEmail);
      if (savedUserId) {
        setUserId(Number(savedUserId));
      }
    }
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Clear auth state
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserId(null);
      
      // We'll handle cart and orders clearing in the respective contexts
      // This removes the circular dependency
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    isAuthenticated,
    userEmail,
    userId,
    setIsAuthenticated,
    setUserEmail,
    setUserId,
    handleLogout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
