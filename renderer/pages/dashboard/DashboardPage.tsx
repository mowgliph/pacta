import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  IconChartBar,
  IconCirclePlus,
  IconFileText,
  IconFileText as TrendingUp,
  IconClipboard,
  IconSettings,
  IconPlus,
} from "@tabler/icons-react";

import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import DashboardCard from "../../components/ui/DashboardCard";
import { QuickAction } from "../../components/dashboard/QuickAction";
import { ActivityFeed } from "../../components/dashboard/ActivityFeed";
import { useDashboardStats } from "../../lib/useDashboardStats";
import { useNotification } from "../../lib/useNotification";
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
import { NewContractModal } from "../../components/modals/NewContractModal";
import { Button } from "../../components/ui/button";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data, loading: statsLoading, error, refetch } = useDashboardStats();
  const { user, isAuthenticated } = useAuth();

  // Estados para modales
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showActiveModal, setShowActiveModal] = useState(false);
  const [allContractsModalOpen, setAllContractsModalOpen] = useState(false);
  const [selectContractModalOpen, setSelectContractModalOpen] = useState(false);
  const [showNewContractModal, setShowNewContractModal] = useState(false);

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
      allContracts: () => handleAuthAction(() => setAllContractsModalOpen(true)),
      expiring: () => handleAuthAction(() => setShowExpiringModal(true)),
      expired: () => handleAuthAction(() => setShowExpiredModal(true)),
      active: () => handleAuthAction(() => setShowActiveModal(true)),
      selectContract: () => handleAuthAction(() => setSelectContractModalOpen(true)),
    },
    close: {
      allContracts: () => setAllContractsModalOpen(false),
      expiring: () => setShowExpiringModal(false),
      expired: () => setShowExpiredModal(false),
      active: () => setShowActiveModal(false),
      auth: () => setShowAuthModal(false),
      selectContract: () => setSelectContractModalOpen(false),
    },
  };
  
  // Handler para navegar a la página de contratos
  const navigateToContracts = () => {
    handleModal.close.allContracts();
    navigate('/contracts');
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

  // Función para manejar valores faltantes
  const handleMissingData = (key: string, value: any, defaultValue: any) => {
    if (value === undefined || value === null) {
      console.error(`[Dashboard] No se pudo obtener el valor para ${key} desde el backend`);
      return defaultValue;
    }
    return value;
  };

  // Asegurar que los datos existan y tengan el formato correcto
  const stats = {
    total: handleMissingData('total', totals?.total, 0),
    active: handleMissingData('active', totals?.active, 0),
    expiring: handleMissingData('expiring', totals?.expiring, 0),
    expired: handleMissingData('expired', totals?.expired, 0),
  };

  const defaultTrend = {
    value: 0,
    positive: true,
    label: "vs mes anterior",
  };

  const trends = {
    total: dashboardTrends?.total || (() => {
      console.error('[Dashboard] No se pudo obtener la tendencia total desde el backend');
      return { ...defaultTrend };
    })(),
    active: dashboardTrends?.active || (() => {
      console.error('[Dashboard] No se pudo obtener la tendencia de activos desde el backend');
      return { ...defaultTrend };
    })(),
    expiring: dashboardTrends?.expiring || (() => {
      console.error('[Dashboard] No se pudo obtener la tendencia de por vencer desde el backend');
      return { ...defaultTrend, positive: false, label: "próximo mes" };
    })(),
    expired: dashboardTrends?.expired || (() => {
      console.error('[Dashboard] No se pudo obtener la tendencia de vencidos desde el backend');
      return { ...defaultTrend, positive: false, label: "este mes" };
    })(),
  };

  // Registrar error si no hay datos
  useEffect(() => {
    if (!data) {
      console.error('[Dashboard] No se recibieron datos del backend');
    } else if (!totals || !dashboardTrends) {
      console.error('[Dashboard] Datos incompletos recibidos del backend:', {
        hasTotals: !!totals,
        hasTrends: !!dashboardTrends,
        hasRecentActivity: !!recentActivity
      });
    }
  }, [data, totals, dashboardTrends, recentActivity]);

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

  // Obtener la función de notificación
  const { notify } = useNotification();

  // Refrescar datos después de crear un nuevo contrato
  const handleContractCreated = useCallback(async () => {
    console.log('[Dashboard] Contrato creado exitosamente, actualizando datos...');
    
    try {
      // Mostrar notificación al usuario
      await notify({
        title: "¡Éxito!",
        body: "El contrato se ha creado correctamente."
      });
      
      // Cerrar el modal de nuevo contrato
      setShowNewContractModal(false);
      
      // Refrescar los datos del dashboard
      console.log('[Dashboard] Forzando actualización de estadísticas...');
      await refetch();
      
      console.log('[Dashboard] Datos actualizados correctamente');
    } catch (error) {
      console.error('[Dashboard] Error al actualizar los datos:', error);
      // Mostrar notificación de error
      await notify({
        title: "Error",
        body: "No se pudieron actualizar los datos del dashboard."
      });
    }
  }, [notify, refetch, setShowNewContractModal]);

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
            <Button 
              onClick={() => setShowNewContractModal(true)}
              className="bg-azul-medio hover:bg-azul-oscuro text-white flex items-center gap-2"
            >
              <IconPlus className="w-4 h-4" />
              Nuevo Contrato
            </Button>
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
                  icon={<TrendingUp className="w-6 h-6 text-primary" />}
                  onClick={() => handleModal.open.allContracts()}
                  trend={trends.total}
                  loading={statsLoading}
                  error={error}
                />
                <DashboardCard
                  title="Vigentes"
                  count={stats.active.toString()}
                  icon={<TrendingUp className="w-6 h-6 text-green-600" />}
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
                  icon={<TrendingUp className="w-6 h-6 text-red-500" />}
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
              icon={<IconCirclePlus className="h-5 w-5" />}
              title="Nuevo Contrato"
              description="Crear un nuevo contrato"
              onClick={() => requireAuth(() => setShowNewContractModal(true))}
              colorScheme="primary"
              className="transition-all hover:shadow-md hover:-translate-y-0.5"
            />
            <QuickAction
              icon={<IconFileText className="h-5 w-5" />}
              title="Nuevo Suplemento"
              description="Añadir suplemento a contrato"
              onClick={() => handleModal.open.selectContract()}
              colorScheme="success"
            />
            <QuickAction
              icon={<IconChartBar />}
              title="Estadísticas"
              description="Ver estadísticas"
              onClick={() => navigate("/statistics")}
              colorScheme="primary"
            />
            <QuickAction
              icon={<IconSettings />}
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
              <div className="divide-y divide-gray-100">
                <ActivityFeed 
                  activities={data.recentActivity.map(activity => ({
                    id: Math.random().toString(36).substr(2, 9), // Generar un ID único
                    type: 'system' as const, // Tipo por defecto
                    title: activity.title,
                    description: activity.description,
                    timestamp: new Date(activity.date),
                    user: { name: 'Sistema' } // Usuario por defecto
                  }))} 
                />
              </div>
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
        onClose={handleModal.close.allContracts}
        onViewAll={navigateToContracts}
        contracts={validateArray(allContracts)}
        loading={allContractsLoading}
        error={allContractsError}
        title="Todos los Contratos"
      />

      {/* Modal para seleccionar contrato al crear un suplemento */}
      <SelectContractModal
        isOpen={selectContractModalOpen}
        onClose={() => setSelectContractModalOpen(false)}
      />
      
      {/* Modal de Nuevo Contrato */}
      <NewContractModal 
        isOpen={showNewContractModal} 
        onClose={() => setShowNewContractModal(false)}
        onSuccess={handleContractCreated}
      />
    </div>
  );
}
