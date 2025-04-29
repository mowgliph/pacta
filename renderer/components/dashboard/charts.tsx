import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  ChevronRight,
  BarChart2,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  PointElement,
  LineElement
);

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const STATUS_COLORS = {
  active: "#10B981",
  expiring_soon: "#F59E0B",
  expired: "#EF4444",
  archived: "#6B7280",
};

// Configuración común para las animaciones
const containerAnimation = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

const chartAnimation = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      delay: 0.1,
    },
  },
};

interface ContractPieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  description?: string;
}

export const ContractPieChart: React.FC<ContractPieChartProps> = ({
  data,
  title,
  description,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerAnimation}>
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-0 flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <motion.div className="h-[300px]" variants={chartAnimation}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ContractBarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
  description?: string;
}

export const ContractBarChart: React.FC<ContractBarChartProps> = ({
  data,
  title,
  description,
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <p className="text-gray-500">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" variants={containerAnimation}>
      <Card className="shadow-sm border overflow-hidden">
        <CardHeader className="pb-0 flex justify-between items-start">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <motion.div className="h-[300px]" variants={chartAnimation}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Componente para el feed de actividad
interface ActivityItem {
  id: string;
  title: string;
  type: "creation" | "modification" | "approval" | "expiration";
  date: string;
  description: string;
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (!activities || activities.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay actividad reciente
      </p>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "creation":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "modification":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "approval":
        return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "expiration":
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "creation":
        return "bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/30";
      case "modification":
        return "bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800/30";
      case "approval":
        return "bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800/30";
      case "expiration":
        return "bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/30";
      default:
        return "bg-gray-50 border-gray-100 dark:bg-gray-900/20 dark:border-gray-800/30";
    }
  };

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0 },
          }}
        >
          <Alert
            variant="default"
            className={`py-3 border ${getActivityBg(
              activity.type
            )} hover:border-primary/20 transition-colors cursor-pointer group`}
          >
            <div className="flex gap-2 items-start justify-between">
              <div className="flex gap-2 items-start min-w-0">
                {getActivityIcon(activity.type)}
                <div className="min-w-0">
                  <AlertTitle className="text-sm font-medium truncate pr-4">
                    {activity.title}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {activity.description}
                    <div className="mt-1 text-xs font-mono text-gray-400">
                      {activity.date}
                    </div>
                  </AlertDescription>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Alert>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface ChartsProps {
  data: {
    status: Array<{ name: string; value: number; color?: string }>;
    type: Array<{ name: string; value: number; color?: string }>;
  };
}

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Contratos por Estado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.status}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.status.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contratos por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.type}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8">
                  {data.type.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
