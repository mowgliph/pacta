import { ReactNode, useEffect, createContext, useContext, useState } from "react";
import { useStore } from "../../store";
import { Login } from "../../pages/Login";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading } = useStore();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if user is authenticated on initial load
  useEffect(() => {
    // In a real app, we'd verify the token with the backend here
    setInitialCheckDone(true);
  }, []);

  // Show a loading state while we check authentication
  if (!initialCheckDone || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <Login />;
  }

  // If authenticated, render children
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
} 