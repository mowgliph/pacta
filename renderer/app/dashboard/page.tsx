import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChartIcon,
  PlusCircledIcon,
  FileTextIcon,
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
import { AuthModal } from "../../components/modals/AuthModal";

import {
  useExpiringContracts,
  useExpiredContracts,
  useAllContracts,
  useActiveContracts,
} from "../../lib/useContracts";

import ActiveContractsModal from "../../components/modals/ActiveContractsModal";
import ExpiringContractsModal from "../../components/modals/ExpiringContractsModal";
import ExpiredContractsModal from "../../components/modals/ExpiredContractsModal";
import AllContractsModal from "../../components/modals/AllContractsModal";
import { SelectContractModal } from "../../components/modals/SelectContractModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading: statsLoading, error } = useDashboardStats();
  const { user, isAuthenticated } = useAuth();

  // Estados para modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [allContractsModalOpen, setAllContractsModalOpen] = useState(false);
  const [selectContractModalOpen, setSelectContractModalOpen] = useState(false);

  // Handler para acciones que requieren autenticación
  const handleAuthAction = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    action();
  };

  // Handlers para modales
  const handleModal = {
    open: {
      expiring: () => handleAuthAction(() => setShowExpiringModal(true)),
      expired: () => handleAuthAction(() => setShowExpiredModal(true)),
      active: () => handleAuthAction(() => setShowActiveModal(true)),
      selectContract: () =>
        handleAuthAction(() => setSelectContractModalOpen(true)),
    },
    close: {
      expiring: () => setShowExpiringModal(false),
      expired: () => setShowExpiredModal(false),
      active: () => setShowActiveModal(false),
      auth: () => setShowAuthModal(false),
      selectContract: () => setSelectContractModalOpen(false),
      allContracts: () => setAllContractsModalOpen(false),
    },
  };
  // Datos de contratos
  const {
    contracts: activeContracts,
    loading: activeContractsLoading,
    error: activeContractsError,
  } = useActiveContracts();

  const {
    contracts: expiringContracts,
    loading: expiringLoading,
    error: expiringError,
  } = useExpiringContracts();

  const {
    contracts: expiredContracts,
    loading: expiredLoading,
    error: expiredError,
  } = useExpiredContracts();

  const {
    contracts: allContracts,
    loading: allContractsLoading,
    error: allContractsError,
  } = useAllContracts();

  // Extraer datos del dashboard
  const { totals, trends: dashboardTrends, recentActivity } = data || {};

  // Asegurar que los datos existan y tengan el formato correcto
  const stats = {
    total: totals?.total || 0,
    active: totals?.active || 0,
    expiring: totals?.expiring || 0,
    expired: totals?.expired || 0,
  };

  const trends = {
    total: dashboardTrends?.total || {
      value: 0,
      positive: true,
      label: "vs mes anterior",
    },
    active: dashboardTrends?.active || {
      value: 0,
      positive: true,
      label: "vs mes anterior",
    },
    expiring: dashboardTrends?.expiring || {
      value: 0,
      positive: false,
      label: "próximo mes",
    },
    expired: dashboardTrends?.expired || {
      value: 0,
      positive: false,
      label: "este mes",
    },
  };

  // Función auxiliar para validar arrays
  const validateArray = (arr: any[] | null | undefined) =>
    Array.isArray(arr) ? arr : [];

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
                  count={stats.total.toString()}
                  icon={<BarChartIcon className="w-6 h-6 text-primary" />}
                  onClick={() => navigate("/contracts")}
                  trend={trends.total}
                  loading={statsLoading}
                />
                <DashboardCard
                  title="Vigentes"
                  count={stats.active.toString()}
                  icon={<ClipboardIcon className="w-6 h-6 text-green-600" />}
                  onClick={handleModal.open.active}
                  trend={trends.active}
                  loading={statsLoading}
                  error={error}
                />
                <DashboardCard
                  title="Próximos a Vencer"
                  count={stats.expiring.toString()}
                  icon={<TrendingUp className="w-6 h-6 text-orange-500" />}
                  onClick={handleModal.open.expiring}
                  trend={trends.expiring}
                  loading={statsLoading}
                  error={error}
                />
                <DashboardCard
                  title="Vencidos"
                  count={stats.expired.toString()}
                  icon={<FileTextIcon className="w-6 h-6 text-red-500" />}
                  onClick={handleModal.open.expired}
                  trend={trends.expired}
                  loading={statsLoading}
                  error={error}
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
              description="Crear contrato"
              onClick={() => requireAuth(() => navigate("/contracts/new"))}
              colorScheme="primary"
            />
            <QuickAction
              icon={<PlusCircledIcon />}
              title="Nuevo Suplemento"
              description="Añadir suplemento"
              onClick={() => handleModal.open.selectContract()}
              colorScheme="success"
            />
            <QuickAction
              icon={<BarChartIcon />}
              title="Estadísticas"
              description="Ver estadísticas"
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
      <AuthModal isOpen={showAuthModal} onClose={handleModal.close.auth} />
      <ActiveContractsModal
        isOpen={showActiveModal}
        onClose={handleModal.close.active}
        contracts={validateArray(activeContracts)}
        loading={activeContractsLoading}
        error={activeContractsError}
        title="Vigentes"
      />
      <ExpiringContractsModal
        isOpen={showExpiringModal}
        onClose={handleModal.close.expiring}
        contracts={validateArray(expiringContracts)}
        loading={expiringLoading}
        error={expiringError}
        title="Próximos a Vencer"
      />
      <ExpiredContractsModal
        isOpen={showExpiredModal}
        onClose={handleModal.close.expired}
        contracts={validateArray(expiredContracts)}
        loading={expiredLoading}
        error={expiredError}
        title="Vencidos"
      />

      {/* Modal de todos los contratos */}
      <AllContractsModal
        isOpen={allContractsModalOpen}
        onClose={() => setAllContractsModalOpen(false)}
        contracts={validateArray(allContracts)}
        loading={allContractsLoading}
        error={allContractsError}
        title="Contratos"
      />

      {/* Modal para seleccionar contrato al crear un suplemento */}
      <SelectContractModal
        isOpen={selectContractModalOpen}
        onClose={() => setSelectContractModalOpen(false)}
      />
    </div>
  );
}
