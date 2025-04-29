import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

export const DashboardStats: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Contratos"
        value={summary.totalContracts}
        icon={<FileText className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Contratos Activos"
        value={summary.activeContracts}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Próximos a Vencer"
        value={summary.expiringContracts}
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <StatsCard
        title="Actividad Reciente"
        value={summary.recentActivity}
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
};
