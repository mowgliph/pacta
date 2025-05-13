import React from "react";
import { Button } from "@/components/ui/button";

export default function Error500Page({ reset }: { reset?: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] p-8">
      <div className="bg-white rounded-xl shadow p-8 flex flex-col items-center gap-4 max-w-md">
        <h1 className="text-3xl font-bold text-[#F44336] mb-2">
          Mantenimiento
        </h1>
        <p className="text-[#757575] text-center mb-4">
          La aplicación está en modo mantenimiento o la API local no responde.
          <br />
          Por favor, inténtalo de nuevo en unos minutos.
        </p>
        <Button
          onClick={reset}
          className="bg-[#018ABE] text-white hover:bg-[#02457A]"
          tabIndex={0}
          aria-label="Reintentar"
        >
          Reintentar
        </Button>
      </div>
    </div>
  );
}
