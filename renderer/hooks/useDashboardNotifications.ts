import { useState, useCallback, useEffect } from "react";
import type { Contract } from "../types/contracts";

interface DashboardNotification {
  id: string;
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useDashboardNotifications(contracts: Contract[] = []) {
  const [notifications, setNotifications] = useState<DashboardNotification[]>(
    []
  );

  const checkExpiringContracts = useCallback(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringContracts = contracts.filter((contract) => {
      const endDate = new Date(contract.endDate);
      return endDate > today && endDate <= thirtyDaysFromNow;
    });

    if (expiringContracts.length > 0) {
      setNotifications((prev) => [
        ...prev,
        {
          id: "expiring-contracts",
          type: "warning",
          title: "Contratos próximos a vencer",
          message: `Tienes ${expiringContracts.length} contrato(s) que vencerán en los próximos 30 días.`,
          action: {
            label: "Ver contratos",
            onClick: () => {
              // Implementar navegación a la lista de contratos
              console.log("Navigate to expiring contracts");
            },
          },
        },
      ]);
    }
  }, [contracts]);

  const checkMissingDocuments = useCallback(() => {
    const contractsWithoutAttachments = contracts.filter(
      (contract) => !contract.attachment
    );

    if (contractsWithoutAttachments.length > 0) {
      setNotifications((prev) => [
        ...prev,
        {
          id: "missing-documents",
          type: "info",
          title: "Documentos pendientes",
          message: `${contractsWithoutAttachments.length} contrato(s) no tienen documentos adjuntos.`,
          action: {
            label: "Revisar",
            onClick: () => {
              // Implementar navegación a la lista de contratos sin documentos
              console.log("Navigate to contracts without documents");
            },
          },
        },
      ]);
    }
  }, [contracts]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  useEffect(() => {
    checkExpiringContracts();
    checkMissingDocuments();
  }, [checkExpiringContracts, checkMissingDocuments]);

  return {
    notifications,
    dismissNotification,
  };
}
