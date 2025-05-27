import { Button } from "../../components/ui/button";
import { AlertTriangle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NotFoundProps = {
  error?: Error;
};

export default function NotFound({ error }: NotFoundProps) {
  const navigate = useNavigate();
  
  // Opcional: Registrar el error en la consola si está disponible
  if (error) {
    console.error("Error en la ruta:", error);
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] px-4">
      <div
        className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 animate-fade-in w-full max-w-md"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D6E8EE] mb-4">
          <AlertTriangle size={32} className="text-[#018ABE]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#001B48] font-inter mb-2 text-center">
          Página no encontrada
        </h1>
        <p className="text-[#757575] text-center mb-6">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
          <br />
          Verifica la URL o utiliza el botón de abajo para volver al inicio.
        </p>
        <Button
          className="bg-[#018ABE] hover:bg-[#02457A] text-white w-full max-w-xs"
          onClick={() => navigate("/dashboard")}
        >
          <Home className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>
      </div>
    </main>
  );
}
