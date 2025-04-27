import type { ReactNode } from "react"
import { Card } from "../ui/card"
import { cn } from "../../lib/utils"
import { Skeleton } from "../ui/skeleton"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string
  description?: string
  icon: ReactNode
  trend?: {
    value: number
    label: string
  }
  className?: string
  color?: "default" | "green" | "amber" | "red" | "blue" | "indigo" | "purple" | "teal"
  loading?: boolean
  subtitle?: string
}

export function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  color = "default",
  loading = false,
  subtitle
}: StatCardProps) {
  const colorClasses = {
    default: "bg-gradient-to-br from-primary to-primary/80 text-white",
    green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    amber: "bg-gradient-to-br from-amber-400 to-amber-500 text-white",
    red: "bg-gradient-to-br from-red-500 to-red-600 text-white",
    blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
    teal: "bg-gradient-to-br from-teal-500 to-teal-600 text-white"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("stat-card overflow-hidden p-6 border-none relative", colorClasses[color], className)}>
        {/* Círculo decorativo */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5"></div>
        
        <div className="flex justify-between items-start">
          <div className="flex flex-col z-10">
            <p className="text-sm font-medium mb-1 opacity-90">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 bg-white/20" />
            ) : (
              <motion.p 
                className="stat-card-value"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {value}
              </motion.p>
            )}
            {description && <p className="text-xs opacity-75">{description}</p>}
            {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
            {trend && (
              <div className="flex items-center mt-2">
                {loading ? (
                  <Skeleton className="h-4 w-16 bg-white/20" />
                ) : (
                  <motion.div 
                    className="flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <span className={cn("text-xs font-medium", trend.value > 0 ? "text-green-300" : "text-red-300")}>
                      {trend.value > 0 ? "+" : ""}
                      {trend.value}%
                    </span>
                    <span className="text-xs ml-1 opacity-75">{trend.label}</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
          <div className="stat-card-icon z-10 bg-white/10 p-2 rounded-md">
            {icon}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
