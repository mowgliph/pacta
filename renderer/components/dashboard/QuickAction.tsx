import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ColorScheme {
  bg: string;
  hover: string;
  icon: string;
  groupHover: string;
}

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  success: {
    bg: "bg-green-50",
    hover: "hover:border-green-500/20",
    icon: "text-green-600",
    groupHover: "group-hover:bg-green-100",
  },
  warning: {
    bg: "bg-orange-50",
    hover: "hover:border-orange-500/20",
    icon: "text-orange-600",
    groupHover: "group-hover:bg-orange-100",
  },
  primary: {
    bg: "bg-primary/5",
    hover: "hover:border-primary/20",
    icon: "text-primary",
    groupHover: "group-hover:bg-primary/10",
  },
};

interface QuickActionProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  colorScheme?: "primary" | "success" | "warning";
  className?: string;
}

export function QuickAction({
  icon,
  title,
  description,
  onClick,
  colorScheme = "primary",
  className = "",
}: QuickActionProps) {
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.primary;

  return (
    <div className={className}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-4 bg-white rounded-xl w-full",
          "border border-gray-100 hover:shadow-md transition-all group",
          colors.hover
        )}
      >
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            colors.bg,
            colors.groupHover
          )}
        >
          {React.cloneElement(icon, {
            className: cn("w-5 h-5", colors.icon, icon.props.className),
          })}
        </div>
        <div className="flex flex-col items-start">
          <span className="font-medium text-gray-900">{title}</span>
          <span className="text-sm text-gray-500">{description}</span>
        </div>
      </motion.button>
    </div>
  );
}
