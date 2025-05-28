import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/utils";

interface RecentActivityProps {
  title: string;
  date: string;
  description: string;
  type?: "success" | "warning" | "error" | "info";
}

export function RecentActivityItem({
  title,
  date,
  description,
  type = "info",
}: RecentActivityProps) {
  const getStatusColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-700";
      case "warning":
        return "bg-orange-50 text-orange-700";
      case "error":
        return "bg-red-50 text-red-700";
      default:
        return "bg-blue-50 text-blue-700";
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div
        className={cn(
          "w-2 h-2 mt-2 rounded-full flex-shrink-0",
          type === "success" && "bg-green-500",
          type === "warning" && "bg-orange-500",
          type === "error" && "bg-red-500",
          type === "info" && "bg-blue-500"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {title}
          </h4>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {format(new Date(date), "d MMM, HH:mm", { locale: es })}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
