import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChartIcon,
  PlusCircledIcon,
  FileTextIcon,
  ArchiveIcon,
  BarChartIcon as TrendingUp,
  ClipboardIcon,
  GearIcon,
} from "@radix-ui/react-icons";

import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import DashboardCard from "../../components/ui/DashboardCard";
import { QuickAction } from "../../components/dashboard/QuickAction";
import { RecentActivityItem } from "../../components/dashboard/RecentActivityItem";
import { useDashboardStats } from "../../lib/useDashboardStats";
import { useAuth } from "../../store/auth";

import { 
  useExpiringContracts, 
  useExpiredContracts, 
  useArchivedContracts,
  useAllContracts,
  useActiveContracts 
} from "../../lib/useContracts";

import ActiveContractsModal from "../../components/modals/ActiveContractsModal";
import ExpiringContractsModal from "../../components/modals/ExpiringContractsModal";
import ExpiredContractsModal from "../../components/modals/ExpiredContractsModal";
import AllContractsModal from "../../components/modals/AllContractsModal";
import ArchivedContractsModal from "../../components/modals/ArchivedContractsModal";
import { SelectContractModal } from "../../components/modals/SelectContractModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading: statsLoading, error } = useDashboardStats();
  const { user } = useAuth();

  // Estados y datos para el modal de contratos activos
  const [activeContractsModalOpen, setActiveContractsModalOpen] = useState(false);
  const { 
    contracts: activeContracts, 
    loading: activeContractsLoading, 
    error: activeContractsError 
  } = useActiveContracts();

  // Estados y datos para el modal de contratos próximos a vencer
  const [expiringModalOpen, setExpiringModalOpen] = useState(false);
  const { 
    contracts: expiringContracts, 
    loading: expiringLoading, 
    error: expiringError 
  } = useExpiringContracts();

  // Estados y datos para el modal de contratos vencidos
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const { 
    contracts: expiredContracts, 
    loading: expiredLoading, 
    error: expiredError 
  } = useExpiredContracts();

  // Estados y datos para el modal de contratos archivados
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  const { 
    contracts: archivedContracts, 
    loading: archivedLoading, 
    error: archivedError 
  } = useArchivedContracts();

  // Estado para controlar la visibilidad del modal de selección de contrato
  const [selectContractModalOpen, setSelectContractModalOpen] = useState(false);

  // Estados y datos para el modal de todos los contratos
  const [allContractsModalOpen, setAllContractsModalOpen] = useState(false);
  const { 
    contracts: allContracts, 
    loading: allContractsLoading, 
    error: allContractsError 
  } = useAllContracts();

  // Constantes para la lógica de visualización
  const MIN_ITEMS_TO_SHOW = 1;
  
  // Contratos próximos a vencer
  const hasExpiringContracts: boolean = 
    Array.isArray(expiringContracts) && 
    expiringContracts.length >= MIN_ITEMS_TO_SHOW;
  const expiringCount: number = Array.isArray(expiringContracts) ? expiringContracts.length : 0;
  const expiringErrorMessage: string | null = expiringError 
    ? `Error al cargar contratos próximos a vencer: ${expiringError}` 
    : null;

  // Contratos vencidos
  const hasExpiredContracts: boolean = 
    Array.isArray(expiredContracts) && 
    expiredContracts.length >= MIN_ITEMS_TO_SHOW;
  const expiredCount: number = Array.isArray(expiredContracts) ? expiredContracts.length : 0;
  const expiredErrorMessage: string | null = expiredError 
    ? `Error al cargar contratos vencidos: ${expiredError}` 
    : null;

  // Contratos archivados
  const hasArchivedContracts: boolean = 
    Array.isArray(archivedContracts) && 
    archivedContracts.length >= MIN_ITEMS_TO_SHOW;
  const archivedCount: number = Array.isArray(archivedContracts) ? archivedContracts.length : 0;
  const archivedErrorMessage: string | null = archivedError 
    ? `Error al cargar contratos archivados: ${archivedError}` 
    : null;

  // Contratos activos
  const hasActiveContracts: boolean = 
    Array.isArray(activeContracts) && 
    activeContracts.length >= MIN_ITEMS_TO_SHOW;
  const activeCount: number = Array.isArray(activeContracts) ? activeContracts.length : 0;
  const activeErrorMessage: string | null = activeContractsError 
    ? `Error al cargar contratos activos: ${activeContractsError}` 
    : null;

  // Handler para acciones que requieren autenticación
  const requireAuth = (cb: () => void) => {
    if (!user) {
      navigate("/login");
      return;
    }
    cb();
  };

  // El dashboard se muestra siempre, con o sin usuario
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex flex-col gap-8">
        {/* Sección de Estadísticas */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Vista General
            </h2>
            <button
              onClick={() => navigate("/statistics")}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2"
            >
              <BarChartIcon className="w-4 h-4" />
              Ver estadísticas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
              <div className="col-span-full text-gray-500 flex items-center justify-center py-12">
                <span className="animate-pulse">Cargando estadísticas...</span>
              </div>
            ) : error ? (
              <div className="col-span-full">
                <Alert variant="destructive">
                  <AlertTitle>Error al cargar estadísticas</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : (
              <>
                <DashboardCard
                  title="Total Contratos"
                  count={data?.totals?.total || 0}
                  icon={<BarChartIcon className="w-6 h-6 text-primary" />}
                  onClick={() => navigate("/contracts")}
                  trend={data?.trends?.total}
                  loading={!data}
                />
                <DashboardCard
                  title="Vigentes"
                  count={data?.totals?.active || 0}
                  icon={<ClipboardIcon className="w-6 h-6 text-green-600" />}
                  onClick={() => setActiveContractsModalOpen(true)}
                  trend={data?.trends?.active}
                  loading={activeContractsLoading || !data}
                  error={activeContractsError}
                />
                <DashboardCard
                  title="Próximos a Vencer"
                  count={data?.totals?.expiring || 0}
                  icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
                  onClick={() => setExpiringModalOpen(true)}
                  trend={data?.trends?.expiring}
                  loading={expiringLoading || !data}
                  error={expiringError}
                />
                <DashboardCard
                  title="Vencidos"
                  count={data?.totals?.expired || 0}
                  icon={<FileTextIcon className="w-6 h-6 text-red-500" />}
                  onClick={() => setExpiredModalOpen(true)}
                  trend={data?.trends?.expired}
                  loading={expiredLoading || !data}
                  error={expiredError}
                />
              </>
            )}
          </div>
        </section>

        {/* Sección de Acciones Rápidas */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={<PlusCircledIcon />}
              title="Nuevo Contrato"
              description="Crear un nuevo contrato"
              onClick={() => requireAuth(() => navigate("/contracts/new"))}
              colorScheme="primary"
            />
            <QuickAction
              icon={<PlusCircledIcon />}
              title="Nuevo Suplemento"
              description="Añadir suplemento a contrato"
              onClick={() => requireAuth(() => setSelectContractModalOpen(true))}
              colorScheme="success"
            />
            <QuickAction
              icon={<BarChartIcon />}
              title="Estadísticas"
              description="Ver reportes y análisis"
              onClick={() => navigate("/statistics")}
              colorScheme="primary"
            />
            <QuickAction
              icon={<GearIcon />}
              title="Configuración"
              description="Ajustes del sistema"
              onClick={() => navigate("/settings")}
              colorScheme="primary"
            />
          </div>
        </section>

        {/* Sección de Actividades Recientes */}
        <section>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {statsLoading ? (
              <div className="p-6 text-center text-gray-500">
                <span className="animate-pulse">Cargando actividades...</span>
              </div>
            ) : error ? (
              <div className="p-6">
                <Alert variant="destructive">
                  <AlertTitle>Error al cargar actividades</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </div>
            ) : data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <RecentActivityItem {...activity} />
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay actividades recientes
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modales */}
      <ActiveContractsModal
        isOpen={activeContractsModalOpen}
        onClose={() => setActiveContractsModalOpen(false)}
        contracts={activeContracts}
        loading={activeContractsLoading}
        error={activeContractsError}
        title="Vigentes"
      />

      {/* Modal de contratos próximos a vencer */}
      <ExpiringContractsModal
        isOpen={expiringModalOpen}
        onClose={() => setExpiringModalOpen(false)}
        contracts={expiringContracts || []}
        loading={expiringLoading}
        error={expiringError}
        title="Próximos a Vencer"
      />

      {/* Modal de contratos vencidos */}
      <ExpiredContractsModal
        isOpen={expiredModalOpen}
        onClose={() => setExpiredModalOpen(false)}
        contracts={expiredContracts || []}
        loading={expiredLoading}
        error={expiredError}
        title="Expirados"
      />

      {/* Modal de todos los contratos */}
      <AllContractsModal
        isOpen={allContractsModalOpen}
        onClose={() => setAllContractsModalOpen(false)}
        contracts={allContracts}
        loading={allContractsLoading}
        error={allContractsError}
        title="Contratos"
      />

      {/* Modal para seleccionar contrato al crear un suplemento */}
      <SelectContractModal
        isOpen={selectContractModalOpen}
        onClose={() => setSelectContractModalOpen(false)}
      />

      {/* Modal de contratos archivados */}
      <ArchivedContractsModal
        isOpen={archivedModalOpen}
        onClose={() => setArchivedModalOpen(false)}
        contracts={archivedContracts}
        loading={archivedLoading}
        error={archivedError}
      />

    </div>
  );
}
