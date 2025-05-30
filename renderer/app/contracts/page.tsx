import React, { useState, useEffect } from "react";
import { useContracts, Contract } from "@/lib/useContracts";
import {
  FilePlus,
  Search,
  Filter,
  FileText,
  Copy,
  Archive,
  PlusCircle,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNotification } from "@/lib/useNotification";
import {
  useContextMenu,
  ContextMenuAction,
} from "@/components/ui/context-menu";
import { useFileDialog } from "@/lib/useFileDialog";
import { Spinner } from "@/components/ui/spinner";
import { useCleanup } from "@/lib/useCleanup";

const tipos = ["Cliente", "Proveedor"] as const;

const PAGE_SIZE = 10;

export default function ContractsPage() {
  const [tipo, setTipo] = useState<"Cliente" | "Proveedor">("Cliente");
  const [search, setSearch] = useState("");
  const { contracts, loading, error } = useContracts(tipo);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const { saveFile } = useFileDialog();
  const { openContextMenu } = useContextMenu();

  const filtered = contracts.filter((c) => {
    if (!c) return false;
    
    const searchTerm = search.toLowerCase();
    const number = c.number?.toLowerCase() || '';
    const company = c.company?.toLowerCase() || '';
    const description = c.description?.toLowerCase() || '';
    
    return (
      number.includes(searchTerm) ||
      company.includes(searchTerm) ||
      description.includes(searchTerm)
    );
  });

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Notificación de contratos próximos a vencer (solo una vez por render)
  useEffect(() => {
    const proximo = contracts.find((c) => c.status === "Próximo a Vencer");
    if (proximo) {
      notify({
        title: "Contrato próximo a vencer",
        body: `El contrato ${proximo.number} está cerca de su fecha de vencimiento.`,
        variant: "warning",
      });
    }
    // Solo al cargar la lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contracts.length]);

  // Limpieza de datos temporales/listeners
  useCleanup(() => {
    setSearch("");
    setPage(1);
    // window.removeEventListener("resize", ...);
  });

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    notify({
      title: "Número copiado",
      body: `Se copió el número de contrato ${number}`,
      variant: "success",
    });
  };

  const handleExportPDF = async (id: string, number: string) => {
    const fileResult = await saveFile({
      title: "Exportar contrato como PDF",
      defaultPath: `Contrato_${number}.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });
    if (!fileResult || !fileResult.filePath) {
      notify({
        title: "Exportación cancelada",
        body: "No se seleccionó ninguna ruta para guardar.",
        variant: "warning",
      });
      return;
    }
    // @ts-ignore
    await window.Electron.contracts.export(id, fileResult.filePath);
    notify({
      title: "Contrato exportado",
      body: "El contrato fue exportado como PDF.",
      variant: "success",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

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
              tabIndex={0}
              aria-label={`Filtrar por tipo ${t}`}
              onKeyDown={(e) => {
                if (e.key === "Enter") setTipo(t);
              }}
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
            aria-label="Buscar contratos"
          />
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-[#018ABE] text-white hover:bg-[#02457A] transition-colors shadow-sm"
          onClick={() => navigate("/contracts/new")}
          tabIndex={0}
          aria-label="Nuevo contrato"
        >
          <FilePlus size={18} /> Nuevo Contrato
        </button>
      </section>

      {/* Tabla de contratos */}
      <section className="bg-white rounded-xl shadow p-4 animate-fade-in-up">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl-custom font-semibold text-[#001B48] font-inter mb-2">
            Contratos {tipo}
          </h1>
          <button
            className="flex items-center gap-1 text-[#018ABE] text-sm hover:underline"
            tabIndex={0}
            aria-label="Filtros avanzados"
          >
            <Filter size={16} /> Filtros avanzados
          </button>
        </div>
        {error ? (
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
                {paginated.map((c) => {
                  const actions: ContextMenuAction[] = [
                    {
                      label: "Ver detalle",
                      icon: <Eye size={16} />,
                      onClick: () => navigate(`/contracts/${c.id}`),
                    },
                    {
                      label: "Agregar suplemento",
                      icon: <PlusCircle size={16} />,
                      onClick: () =>
                        navigate(`/contracts/${c.id}/supplements/new`),
                    },
                    {
                      label: "Archivar",
                      icon: <Archive size={16} />,
                      onClick: async () => {
                        try {
                          // @ts-ignore
                          await window.Electron.ipcRenderer.invoke(
                            "contracts:archive",
                            c.id
                          );
                          notify({
                            title: "Contrato archivado",
                            body: "El contrato fue archivado correctamente.",
                            variant: "success",
                          });
                          window.location.reload();
                        } catch {
                          notify({
                            title: "Error",
                            body: "No se pudo archivar el contrato.",
                            variant: "error",
                          });
                        }
                      },
                    },
                    {
                      label: "Copiar número",
                      icon: <Copy size={16} />,
                      onClick: () => handleCopyNumber(c.number),
                    },
                    {
                      label: "Exportar PDF",
                      icon: <FileText size={16} />,
                      onClick: () => handleExportPDF(c.id, c.number),
                    },
                  ];
                  return (
                    <tr
                      key={c.id}
                      className="even:bg-[#F9FBFC] hover:bg-[#D6E8EE] transition-colors cursor-pointer select-none"
                      tabIndex={0}
                      aria-label={`Contrato: ${c.number}`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        openContextMenu(actions, e.clientX, e.clientY);
                      }}
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
                        {c.amount ? new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "USD",
                        }).format(c.amount) : 'N/A'}
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
                          onClick={() => navigate(`/contracts/${c.id}`)}
                          tabIndex={0}
                          aria-label="Ver detalle del contrato"
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLButtonElement>
                          ) => {
                            if (e.key === "Enter")
                              navigate(`/contracts/${c.id}`);
                          }}
                        >
                          Ver Detalle
                        </button>
                        <button
                          className="text-[#4CAF50] hover:underline text-xs"
                          onClick={() =>
                            navigate(`/contracts/${c.id}/supplements/new`)
                          }
                          tabIndex={0}
                          aria-label="Agregar suplemento"
                          onKeyDown={(
                            e: React.KeyboardEvent<HTMLButtonElement>
                          ) => {
                            if (e.key === "Enter")
                              navigate(`/contracts/${c.id}/supplements/new`);
                          }}
                        >
                          Agregar Suplemento
                        </button>
                        <button
                          className="text-[#757575] hover:underline text-xs"
                          onClick={async () => {
                            try {
                              // @ts-ignore
                              await window.Electron.ipcRenderer.invoke(
                                "contracts:archive",
                                c.id
                              );
                              notify({
                                title: "Contrato archivado",
                                body: "El contrato fue archivado correctamente.",
                                variant: "success",
                              });
                              window.location.reload();
                            } catch {
                              notify({
                                title: "Error",
                                body: "No se pudo archivar el contrato.",
                                variant: "error",
                              });
                            }
                          }}
                          tabIndex={0}
                          aria-label="Archivar contrato"
                        >
                          Archivar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-[#D6E8EE] text-[#001B48] disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Página anterior"
          >
            Anterior
          </button>
          <span className="px-2 text-sm text-[#757575]">
            Página {page} de {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-[#D6E8EE] text-[#001B48] disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Página siguiente"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Animaciones gestionadas por TailwindCSS, no se requiere <style> */}
    </div>
  );
}
