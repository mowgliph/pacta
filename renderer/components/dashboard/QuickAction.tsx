import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { IconArrowRight, IconPlus, IconExternalLink } from "@tabler/icons-react";

interface ColorScheme {
  bg: string;
  hover: string;
  icon: string;
  groupHover: string;
  border: string;
  indicator: string;
}

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  success: {
    bg: "bg-green-50",
    hover: "hover:border-green-500/20",
    icon: "text-green-600",
    groupHover: "group-hover:bg-green-100/80",
    border: "border-green-100",
    indicator: "text-green-500"
  },
  warning: {
    bg: "bg-orange-50",
    hover: "hover:border-orange-500/20",
    icon: "text-orange-600",
    groupHover: "group-hover:bg-orange-100/80",
    border: "border-orange-100",
    indicator: "text-orange-500"
  },
  primary: {
    bg: "bg-primary/5",
    hover: "hover:border-primary/20",
    icon: "text-primary",
    groupHover: "group-hover:bg-primary/10",
    border: "border-primary/20",
    indicator: "text-primary"
  },
  blue: {
    bg: "bg-blue-50",
    hover: "hover:border-blue-500/20",
    icon: "text-blue-600",
    groupHover: "group-hover:bg-blue-100/80",
    border: "border-blue-100",
    indicator: "text-blue-500"
  },
  purple: {
    bg: "bg-purple-50",
    hover: "hover:border-purple-500/20",
    icon: "text-purple-600",
    groupHover: "group-hover:bg-purple-100/80",
    border: "border-purple-100",
    indicator: "text-purple-500"
  }
};

interface QuickActionProps {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  colorScheme?: "primary" | "success" | "warning" | "blue" | "purple";
  className?: string;
  indicator?: 'arrow' | 'plus' | 'external' | 'none';
  badge?: string;
}

const INDICATOR_ICONS = {
  arrow: IconArrowRight,
  plus: IconPlus,
  external: IconExternalLink,
  none: null
} as const;

export function QuickAction({
  icon,
  title,
  description,
  onClick,
  colorScheme = "primary",
  className = "",
  indicator = 'arrow',
  badge,
}: QuickActionProps) {
  const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.primary;
  const IndicatorIcon = indicator !== 'none' ? INDICATOR_ICONS[indicator] : null;

  return (
    <div className={cn("relative", className)}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.15 }}
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg w-full text-left transition-colors",
          "bg-white hover:bg-gray-50 active:bg-gray-100",
          "border border-gray-200 hover:border-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
        )}
      >
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
              "group-hover:scale-110 transform-gpu",
              colors.bg,
              colors.groupHover,
            )}
          >
            {React.cloneElement(icon, {
              className: cn("w-4 h-4", colors.icon, icon.props.className)
            })}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 truncate">{description}</p>
        </div>
        {badge && (
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
            colors.bg,
            colors.icon
          )}>
            {badge}
          </span>
        )}
        {IndicatorIcon && (
          <div className={cn("text-gray-400 group-hover:text-gray-600 transition-colors")}>
            <IndicatorIcon className="w-4 h-4" />
          </div>
        )}
      </motion.button>
    </div>
  );
}
