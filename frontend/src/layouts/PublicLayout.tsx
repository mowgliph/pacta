import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-md">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <h1 className="text-2xl font-bold">PACTA</h1>
          </Link>
          
          <Link to="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-white/80 backdrop-blur-sm border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          PACTA - Plataforma de Automatización y Control de Contratos Empresariales &copy; 2025
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;