import { Button } from "../../components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] px-4">
      <div
        className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 animate-fade-in"
        style={{ maxWidth: 400 }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D6E8EE] mb-4">
          <AlertTriangle size={40} className="text-[#018ABE]" />
        </div>
        <h1 className="text-3xl font-bold text-[#001B48] font-inter mb-2">
          Sección no encontrada
        </h1>
        <p className="text-[#757575] text-center mb-6">
          No pudimos encontrar la sección o recurso solicitado.
          <br />
          Es posible que haya sido movido o eliminado.
        </p>
        <Button
          className="bg-[#018ABE] hover:bg-[#02457A] text-white w-full"
          onClick={() => navigate("/dashboard")}
        >
          Ir al Dashboard
        </Button>
      </div>
    </main>
  );
}
