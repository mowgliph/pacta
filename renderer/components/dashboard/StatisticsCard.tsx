import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatisticsCardProps {
  title: string;
  value: number;
  trend?: number;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export function StatisticsCard({
  title,
  value,
  trend = 0,
  icon,
  isLoading = false,
}: StatisticsCardProps) {
  const getTrendIcon = () => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[100px]" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[50px]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend !== 0 && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <span
                className={cn(
                  "text-sm",
                  trend > 0 ? "text-green-500" : "text-red-500"
                )}
              >
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
