import React from "react";
import { motion } from "framer-motion";
import { ArrowUpIcon, ArrowDownIcon } from "@radix-ui/react-icons";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  trend,
  icon,
  description,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline space-x-2">
            <h3 className="text-2xl font-semibold text-gray-900">{value}</h3>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                  trend.isPositive
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        <div className="rounded-lg bg-primary/5 p-3 text-primary">{icon}</div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/20 to-primary"
        style={{
          transform: `scaleX(${
            trend ? Math.min(Math.abs(trend.value) / 100, 1) : 0.5
          })`,
          transformOrigin: "left",
          transition: "transform 0.3s ease-in-out",
        }}
      />
    </motion.div>
  );
}
