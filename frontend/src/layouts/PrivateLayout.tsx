import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type PrivateLayoutProps = {
  isAuthenticated: boolean;
  onLogout: () => void;
};

const PrivateLayout = ({ isAuthenticated, onLogout }: PrivateLayoutProps) => {
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;