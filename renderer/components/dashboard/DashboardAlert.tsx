import React from "react";
import { motion } from "framer-motion";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

interface DashboardAlertProps {
  type: "warning" | "success" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const alertStyles = {
  warning: {
    bg: "bg-orange-50",
    icon: "text-orange-600",
    border: "border-orange-100",
    button: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  },
  success: {
    bg: "bg-green-50",
    icon: "text-green-600",
    border: "border-green-100",
    button: "bg-green-100 text-green-700 hover:bg-green-200",
  },
  info: {
    bg: "bg-blue-50",
    icon: "text-blue-600",
    border: "border-blue-100",
    button: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  },
};

const AlertIcon = ({ type }: { type: "warning" | "success" | "info" }) => {
  switch (type) {
    case "warning":
      return <IconAlertTriangle className="h-5 w-5" />;
    case "success":
      return <IconCircleCheck className="h-5 w-5" />;
    case "info":
      return <IconInfoCircle className="h-5 w-5" />;
  }
};

export function DashboardAlert({
  type,
  title,
  message,
  action,
}: DashboardAlertProps) {
  const styles = alertStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-lg border ${styles.bg} ${styles.border} p-4`}
    >
      <div className="flex">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <AlertIcon type={type} />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <div className="mt-2 text-sm text-gray-600">
            <p>{message}</p>
          </div>
          {action && (
            <div className="mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${styles.button}`}
                onClick={action.onClick}
              >
                {action.label}
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
