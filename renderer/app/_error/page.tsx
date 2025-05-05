"use client";

import { Button } from "../../components/ui/button";
import { Wrench } from "lucide-react";

export default function Error500() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#F5F5F5] px-4">
      <div
        className="flex flex-col items-center bg-white rounded-xl shadow-md p-8 animate-fade-in"
        style={{ maxWidth: 400 }}
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#D6E8EE] mb-4">
          <Wrench size={40} className="text-[#018ABE]" />
        </div>
        <h1 className="text-3xl font-bold text-[#001B48] font-inter mb-2">
          Mantenimiento
        </h1>
        <h2 className="text-lg font-semibold text-[#02457A] mb-2">
          La aplicación está en mantenimiento
        </h2>
        <p className="text-[#757575] text-center mb-6">
          Estamos realizando tareas de actualización o experimentando un error
          interno.
          <br />
          Por favor, inténtalo de nuevo en unos minutos.
        </p>
        <Button
          className="bg-[#018ABE] hover:bg-[#02457A] text-white w-full"
          onClick={handleReload}
        >
          Reintentar
        </Button>
      </div>
    </main>
  );
}
