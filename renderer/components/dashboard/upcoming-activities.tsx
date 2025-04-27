import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Clock, Calendar, AlertCircle } from "lucide-react"
import { cn } from "../../lib/utils"

interface Activity {
  id: string
  title: string
  date: string
  type: "expiration" | "renewal" | "approval" | "review"
  priority: "high" | "medium" | "low"
}

interface UpcomingActivitiesProps {
  activities: Activity[]
}

export function UpcomingActivities({ activities }: UpcomingActivitiesProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "expiration":
        return <Clock className="h-5 w-5 text-red-500" />
      case "renewal":
        return <Calendar className="h-5 w-5 text-green-500" />
      case "approval":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "review":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }

  const getPriorityClass = (priority: Activity["priority"]) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500"
      case "medium":
        return "border-l-4 border-yellow-500"
      case "low":
        return "border-l-4 border-green-500"
      default:
        return ""
    }
  }

  return (
    <Card className="dashboard-card">
      <CardHeader className="dashboard-card-header">
        <CardTitle className="dashboard-card-title">Próximas Actividades</CardTitle>
      </CardHeader>
      <CardContent className="dashboard-card-content">
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={cn("p-3 bg-gray-50 rounded-md flex items-start", getPriorityClass(activity.priority))}
            >
              <div className="mr-3 mt-1">{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <h4 className="font-medium text-primary-900">{activity.title}</h4>
                <p className="text-sm text-gray-500">{activity.date}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-primary-800 border-primary-800 hover:bg-primary-500/10"
              >
                Ver
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
