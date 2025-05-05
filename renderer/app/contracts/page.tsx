"use client";
import React, { useState } from "react";
import { useContracts, Contract } from "../../lib/useContracts";
import { FilePlus, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";

const tipos = ["Cliente", "Proveedor"] as const;

export default function ContractsPage() {
  const [tipo, setTipo] = useState<"Cliente" | "Proveedor">("Cliente");
  const [search, setSearch] = useState("");
  const { contracts, loading, error } = useContracts(tipo);
  const router = useRouter();

  const filtered = contracts.filter(
    (c) =>
      c.number.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Filtros y acciones */}
      <section className="flex flex-wrap items-center gap-4 mb-2 animate-fade-in">
        <div className="flex gap-2 bg-white rounded-lg shadow-sm p-2">
          {tipos.map((t) => (
            <button
              key={t}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                tipo === t
                  ? "bg-[#018ABE] text-white shadow"
                  : "text-[#018ABE] hover:bg-[#D6E8EE]"
              }`}
              onClick={() => setTipo(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center bg-white rounded-lg shadow-sm px-3 py-2 gap-2">
          <Search size={18} className="text-[#757575]" />
          <input
            type="text"
            placeholder="Buscar por número, empresa o descripción..."
            className="outline-none border-none bg-transparent text-sm w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[#018ABE] text-white hover:bg-[#02457A] transition-colors shadow-sm"
          onClick={() => router.push("/contracts/new")}
        >
          <FilePlus size={18} /> Nuevo Contrato
        </button>
      </section>

      {/* Tabla de contratos */}
      <section className="bg-white rounded-xl shadow p-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-[#001B48] font-inter">
            Contratos {tipo}
          </h2>
          <button className="flex items-center gap-1 text-[#018ABE] text-sm hover:underline">
            <Filter size={16} /> Filtros avanzados
          </button>
        </div>
        {loading ? (
          <div className="text-[#757575]">Cargando contratos...</div>
        ) : error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error al cargar contratos</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filtered.length === 0 ? (
          <div className="text-[#757575]">No se encontraron contratos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-[#D6E8EE] text-[#001B48]">
                  <th className="px-4 py-2 text-left font-medium">Número</th>
                  <th className="px-4 py-2 text-left font-medium">Empresa</th>
                  <th className="px-4 py-2 text-left font-medium">Tipo</th>
                  <th className="px-4 py-2 text-left font-medium">
                    Fecha Inicio
                  </th>
                  <th className="px-4 py-2 text-left font-medium">Fecha Fin</th>
                  <th className="px-4 py-2 text-left font-medium">Monto</th>
                  <th className="px-4 py-2 text-left font-medium">Estado</th>
                  <th className="px-4 py-2 text-left font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors"
                  >
                    <td className="px-4 py-2">{c.number}</td>
                    <td className="px-4 py-2">{c.company}</td>
                    <td className="px-4 py-2">{c.type}</td>
                    <td className="px-4 py-2">
                      {new Date(c.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(c.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      {c.amount.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          c.status === "Vigente"
                            ? "bg-[#D6E8EE] text-[#018ABE]"
                            : c.status === "Vencido"
                            ? "bg-[#F44336]/10 text-[#F44336]"
                            : c.status === "Próximo a Vencer"
                            ? "bg-[#FF9800]/10 text-[#FF9800]"
                            : "bg-[#F5F5F5] text-[#757575]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        className="text-[#018ABE] hover:underline text-xs"
                        onClick={() => router.push(`/contracts/${c.id}`)}
                      >
                        Ver Detalle
                      </button>
                      <button
                        className="text-[#4CAF50] hover:underline text-xs"
                        onClick={() =>
                          router.push(`/contracts/${c.id}/supplements/new`)
                        }
                      >
                        Agregar Suplemento
                      </button>
                      <button
                        className="text-[#757575] hover:underline text-xs"
                        onClick={async () => {
                          try {
                            // @ts-ignore
                            await window.Electron.contracts.archive(c.id);
                            // @ts-ignore
                            await window.Electron.notifications.show({
                              title: "Contrato archivado",
                              body: "El contrato fue archivado correctamente.",
                            });
                            // Opcional: recargar la lista de contratos
                            window.location.reload();
                          } catch (err) {
                            // @ts-ignore
                            await window.Electron.notifications.show({
                              title: "Error",
                              body: "No se pudo archivar el contrato.",
                            });
                          }
                        }}
                      >
                        Archivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Animaciones gestionadas por TailwindCSS, no se requiere <style> */}
    </div>
  );
}
