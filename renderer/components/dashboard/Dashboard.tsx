"use client";

import React from "react";
import { BasicStatistics } from "../statistics/BasicStatistics";
import { RecentContractsTable } from "./RecentContractsTable";
import { ActivityFeed } from "./ActivityFeed";
import { UpcomingExpirations } from "./UpcomingExpirations";
import { useDashboard } from "../../hooks/useDashboard";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

export function Dashboard() {
  const { data, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No hay datos disponibles</AlertTitle>
        <AlertDescription>
          No se encontraron datos para mostrar en el dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <BasicStatistics
        byState={data.byState}
        byType={data.byType}
        totalContracts={data.totalContracts}
        activeContracts={data.activeContracts}
        expiringContracts={data.expiringContracts}
        recentActivity={data.recentActivity}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentContractsTable contracts={data.recentContracts} />
        <UpcomingExpirations contracts={data.expiringSoon} />
      </div>

      <ActivityFeed activities={data.recentActivityList} />
    </div>
  );
}
