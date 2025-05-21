import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Contract } from "@/lib/useContracts";
import {
  BarChart2,
  FilePlus,
  PlusCircle,
  Search,
  TrendingUp,
  FileText,
} from "lucide-react";
import { useDashboardStats } from "@/lib/useDashboardStats";
import { useExpiringContracts } from "@/lib/useExpiringContracts";
import { useAuth } from "@/store/auth";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import DashboardCard from "@/components/ui/DashboardCard";
import type { StatisticsDashboard } from "@/types/electron.d";

// Importaciones de modales
import ExpiredContractsModal from "@/components/modals/ExpiredContractsModal";
import ActiveContractsModal from "@/components/modals/ActiveContractsModal";
import ExpiringContractsModal from "@/components/modals/ExpiringContractsModal";
import AllContractsModal from "@/components/modals/AllContractsModal";
import { SelectContractModal } from "@/components/modals/SelectContractModal";

function QuickAction({
  label,
  icon,
  onClick,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium shadow-sm bg-white hover:bg-[#D6E8EE] transition-colors duration-150 border border-transparent hover:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE] ${color}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function RecentActivityItem({
  title,
  date,
  description,
}: {
  title: string;
  date: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center">
        <span className="font-medium text-[#001B48]">{title}</span>
        <span className="text-xs text-[#757575]">{date}</span>
      </div>
      <span className="text-sm text-[#757575]">{description}</span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function DashboardPage() {
  const { data, loading: statsLoading, error } = useDashboardStats();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados y datos para los modales
  const [activeContractsModalOpen, setActiveContractsModalOpen] = useState(false);
  const [activeContracts, setActiveContracts] = useState<Array<Contract>>([]);
  const [loading, setLoading] = useState(false);

  // Estados y datos para modal de contratos próximos a vencer
  const [expiringModalOpen, setExpiringModalOpen] = useState(false);
  const { contracts: expiringContracts, loading: expiringLoading, error: expiringError } = useExpiringContracts();

  // Estados y datos para el modal de contratos vencidos
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const [expiredContracts, setExpiredContracts] = useState<Contract[]>([]);
  const [expiredLoading, setExpiredLoading] = useState(false);
  const [expiredError, setExpiredError] = useState<string | null>(null);

  // Estados y datos para los modales
  const [selectContractModalOpen, setSelectContractModalOpen] = useState(false);
  const [allContractsModalOpen, setAllContractsModalOpen] = useState(false);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [allContractsLoading, setAllContractsLoading] = useState(false);
  const [allContractsError, setAllContractsError] = useState<string | null>(null);

  // Verificar si hay contratos próximos a vencer
  const hasExpiringContracts = expiringContracts.length > 0;
  const showExpiringCard = hasExpiringContracts || expiringLoading || Boolean(expiringError);

  // Handler para acciones que requieren autenticación
  const requireAuth = (cb: () => void) => {
    if (!user) {
      navigate("/login");
      return;
    }
    cb();
  };

  // Cargar contratos activos al abrir el modal
  const handleOpenActiveContractsModal = async () => {
    try {
      const response = await window.Electron?.ipcRenderer.invoke<{ data: Contract[] }>("contracts:list", { 
        status: "Vigente" 
      });
      
      if (response) {
        setActiveContracts(response.data || []);
      } else {
        console.error("Error al cargar contratos vigentes");
      }
    } catch (err) {
      console.error("Error:", err);
    }
    
    setActiveContractsModalOpen(true);
  };

  // Abrir modal de contratos próximos a vencer
  const handleOpenExpiringContractsModal = () => {
    setExpiringModalOpen(true);
  };

  // Abrir modal de contratos vencidos
  const handleOpenExpiredContractsModal = async () => {
    setExpiredLoading(true);
    setExpiredError(null);
    
    try {
      const response = await window.Electron?.ipcRenderer.invoke<{ data: Contract[] }>("contracts:list", { 
        status: "Vencido"
      });
      
      if (response) {
        setExpiredContracts(response.data || []);
        setExpiredModalOpen(true);
      } else {
        setExpiredError("No se pudieron cargar los contratos vencidos");
        setExpiredModalOpen(true);
      }
    } catch (err) {
      console.error("Error al cargar contratos vencidos:", err);
      setExpiredError("Error al cargar los contratos vencidos. Intente nuevamente.");
      setExpiredModalOpen(true);
    } finally {
      setExpiredLoading(false);
    }
  };

  // Exportar contratos activos a PDF
  const handleExportActiveContractsPDF = async (contracts: Contract[]) => {
    if (!contracts.length) {
      alert("No hay contratos activos para exportar");
      return;
    }

    try {
      // Solicitar ubicación para guardar
      const fileResult = await window.Electron?.files.save({
        title: "Exportar contratos vigentes como PDF",
        defaultPath: `Contratos_Vigentes_${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      
      if (!fileResult?.filePath) {
        return; // Usuario canceló el diálogo
      }
      
      // Mostrar indicador de carga
      setLoading(true);
      
      // Invocar al IPC para exportar
      await window.Electron?.ipcRenderer.invoke("reports:exportActiveContracts", {
        filePath: fileResult.filePath,
        contractIds: contracts.map(c => c.id)
      });
      
      // Notificar éxito
      alert(`Se exportaron ${contracts.length} contratos activos correctamente.`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert(`Error al exportar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal de todos los contratos
  const handleOpenAllContractsModal = async () => {
    setAllContractsLoading(true);
    setAllContractsError(null);
    
    try {
      const response = await window.Electron?.ipcRenderer.invoke<{ data: Contract[] }>("contracts:list");
      
      if (response) {
        setAllContracts(response.data || []);
        setAllContractsModalOpen(true);
      } else {
        setAllContractsError("No se pudieron cargar los contratos");
        setAllContractsModalOpen(true);
      }
    } catch (err) {
      console.error("Error al cargar todos los contratos:", err);
      setAllContractsError("Error al cargar los contratos. Intente nuevamente.");
      setAllContractsModalOpen(true);
    } finally {
      setAllContractsLoading(false);
    }
  };

  // Exportar contratos vencidos a PDF
  const handleExportExpiredContractsPDF = async (contracts: Contract[]) => {
    if (!contracts.length) {
      alert("No hay contratos vencidos para exportar");
      return;
    }

    try {
      // Solicitar ubicación para guardar
      const fileResult = await window.Electron?.files.save({
        title: "Exportar contratos vencidos como PDF",
        defaultPath: `Contratos_Vencidos_${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      
      if (!fileResult?.filePath) {
        return; // Usuario canceló el diálogo
      }
      
      // Mostrar indicador de carga
      setLoading(true);
      
      // Invocar al IPC para exportar
      await window.Electron?.ipcRenderer.invoke("reports:exportExpiredContracts", {
        filePath: fileResult.filePath,
        contractIds: contracts.map(c => c.id)
      });
      
      // Notificar éxito
      alert(`Se exportaron ${contracts.length} contratos vencidos correctamente.`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert(`Error al exportar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Exportar todos los contratos a PDF
  const handleExportAllContractsPDF = async (contracts: Contract[]) => {
    if (!contracts.length) {
      alert("No hay contratos para exportar");
      return;
    }

    try {
      // Solicitar ubicación para guardar
      const fileResult = await window.Electron?.files.save({
        title: "Exportar todos los contratos como PDF",
        defaultPath: `Todos_Los_Contratos_${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      
      if (!fileResult?.filePath) {
        return; // Usuario canceló el diálogo
      }
      
      // Mostrar indicador de carga
      setLoading(true);
      
      // Invocar al IPC para exportar
      await window.Electron?.ipcRenderer.invoke("reports:exportAllContracts", {
        filePath: fileResult.filePath,
        contractIds: contracts.map(c => c.id)
      });
      
      // Notificar éxito
      alert(`Se exportaron ${contracts.length} contratos correctamente.`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert(`Error al exportar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Exportar contratos próximos a vencer a PDF
  const handleExportExpiringContractsPDF = async (contracts: Contract[]) => {
    if (!contracts.length) {
      alert("No hay contratos próximos a vencer para exportar");
      return;
    }

    try {
      // Solicitar ubicación para guardar
      const fileResult = await window.Electron?.files.save({
        title: "Exportar contratos próximos a vencer como PDF",
        defaultPath: `Contratos_Proximos_Vencer_${new Date().toISOString().slice(0, 10)}.pdf`,
        filters: [{ name: "PDF", extensions: ["pdf"] }],
      });
      
      if (!fileResult?.filePath) {
        return; // Usuario canceló el diálogo
      }
      
      // Mostrar indicador de carga
      setLoading(true);
      
      // Invocar al IPC para exportar
      await window.Electron?.ipcRenderer.invoke("reports:exportExpiringContracts", {
        filePath: fileResult.filePath,
        contractIds: contracts.map(c => c.id)
      });
      
      // Notificar éxito
      alert(`Se exportaron ${contracts.length} contratos próximos a vencer correctamente.`);
    } catch (err) {
      console.error("Error al exportar PDF:", err);
      alert(`Error al exportar el reporte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // El dashboard se muestra siempre, con o sin usuario
  return (
    <div className="flex flex-col gap-8">
      {/* Sección 1: Estadísticas generales */}
      <section className="flex flex-wrap gap-6 animate-fade-in">
        {statsLoading ? (
          <div className="text-[#757575]">Cargando estadísticas...</div>
        ) : error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error al cargar estadísticas</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            {/* Mostrar tarjetas con valores en 0 */}
            <DashboardCard
              title="Contratos Vigentes"
              count={0}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
              onClick={handleOpenActiveContractsModal}
            />
            <DashboardCard
              title="Contratos Próximos a Vencer"
              count={0}
              icon={<TrendingUp size={28} className="text-[#FF9800]" />}
              color="bg-[#FF9800]"
              onClick={handleOpenExpiringContractsModal}
            />
            <DashboardCard
              title="Contratos Vencidos"
              count={data?.totals?.expired || 0}
              icon={<FileText className="h-5 w-5" />}
              color="bg-red-100 text-red-600"
              onClick={handleOpenExpiredContractsModal}
            />
            <DashboardCard
              title="Total Contratos"
              count={0}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
              onClick={handleOpenAllContractsModal}
            />
          </>
        ) : data?.totals ? (
          <>
            <DashboardCard
              title="Contratos Vigentes"
              count={data.totals.active || 0}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
              onClick={handleOpenActiveContractsModal}
            />
            <DashboardCard
              title="Contratos Próximos a Vencer"
              count={data.totals.expiring || 0}
              icon={<TrendingUp size={28} className="text-[#FF9800]" />}
              color="bg-[#FF9800]"
              onClick={handleOpenExpiringContractsModal}
            />
            <DashboardCard
              title="Total Contratos"
              count={data.totals.total || 0}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
              onClick={handleOpenAllContractsModal}
            />
          </>
        ) : null}
      </section>

      {/* Sección 2: Acciones rápidas */}
      <section className="flex flex-wrap gap-4 animate-fade-in-up">
        <QuickAction
          label="Nuevo Contrato"
          icon={<FilePlus size={20} className="text-[#018ABE]" />}
          color=""
          onClick={() => requireAuth(() => navigate("/contracts/new"))}
        />
        <QuickAction
          label="Nuevo Suplemento"
          icon={<PlusCircle size={20} className="text-[#02457A]" />}
          color=""
          onClick={() => requireAuth(() => setSelectContractModalOpen(true))}
        />
        <QuickAction
          label="Buscar Contrato"
          icon={<Search size={20} className="text-[#001B48]" />}
          color=""
          onClick={() => navigate("/contracts")}
        />
        <QuickAction
          label="Ver Estadísticas Avanzadas"
          icon={<BarChart2 size={20} className="text-[#018ABE]" />}
          color=""
          onClick={() => navigate("/statistics")}
        />
      </section>

      {/* Sección 3: Actividades recientes */}
      <section className="flex flex-col gap-3 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-[#001B48] mb-2 font-inter">
          Actividades recientes
        </h2>
        {loading ? (
          <div className="text-[#757575]">Cargando actividades...</div>
        ) : error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error al cargar actividades</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-[#757575]">No hay actividades recientes.</div>
          </>
        ) : data && data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentActivity.map((item) => (
              <RecentActivityItem
                key={item.id}
                title={item.name}
                date={formatDate(item.date)}
                description={item.description}
              />
            ))}
          </div>
        ) : (
          <div className="text-[#757575]">No hay actividades recientes.</div>
        )}
      </section>

      {/* Modal de contratos vigentes */}
      <ActiveContractsModal
        isOpen={activeContractsModalOpen}
        onClose={() => setActiveContractsModalOpen(false)}
        contracts={activeContracts}
        onExportPDF={handleExportActiveContractsPDF}
        title="Contratos Vigentes"
      />
      
      {/* Modal de contratos próximos a vencer */}
      {showExpiringCard && (
        <ExpiringContractsModal
          isOpen={expiringModalOpen}
          onClose={() => setExpiringModalOpen(false)}
          contracts={expiringContracts}
          loading={expiringLoading}
          error={expiringError}
          onExportPDF={handleExportExpiringContractsPDF}
          title="Contratos Próximos a Vencer"
        />
      )}

      {/* Modal de contratos vencidos */}
      <ExpiredContractsModal
        isOpen={expiredModalOpen}
        onClose={() => setExpiredModalOpen(false)}
        contracts={expiredContracts}
        loading={expiredLoading}
        error={expiredError}
        onExportPDF={handleExportExpiredContractsPDF}
      />

      {/* Modal de todos los contratos */}
      <AllContractsModal
        isOpen={allContractsModalOpen}
        onClose={() => setAllContractsModalOpen(false)}
        contracts={allContracts}
        loading={allContractsLoading}
        error={allContractsError}
        onExportPDF={handleExportAllContractsPDF}
        title="Todos los Contratos"
      />

      {/* Modal para seleccionar contrato al crear un suplemento */}
      <SelectContractModal 
        isOpen={selectContractModalOpen} 
        onClose={() => setSelectContractModalOpen(false)} 
      />
    </div>
  );
}
