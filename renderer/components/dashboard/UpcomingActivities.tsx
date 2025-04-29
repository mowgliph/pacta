import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface Activity {
  id: string;
  title: string;
  date: string;
  type: "expiration" | "renewal" | "approval" | "review";
  priority: "high" | "medium" | "low";
  contractId: string;
}

interface UpcomingActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

export function UpcomingActivities({
  activities,
  loading = false,
}: UpcomingActivitiesProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando actividades...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No hay actividades próximas</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "expiration":
        return <Clock className="h-4 w-4" />;
      case "renewal":
        return <Calendar className="h-4 w-4" />;
      case "approval":
        return <CheckCircle className="h-4 w-4" />;
      case "review":
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: Activity["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Actividades Próximas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between p-3 rounded-lg border"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={cn(
                  "capitalize",
                  getPriorityColor(activity.priority)
                )}
              >
                {activity.priority}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
