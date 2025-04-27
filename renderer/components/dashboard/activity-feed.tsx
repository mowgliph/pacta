import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { 
  FileText, 
  UserPlus, 
  FileEdit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  FileSignature, 
  Clock, 
  MessageSquare,
  ShieldCheck,
  MoreHorizontal
} from "lucide-react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { motion } from "framer-motion";

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    contractId?: string;
    contractTitle?: string;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "contract_created":
        return <FileText className="h-4 w-4 text-green-500" />;
      case "contract_updated":
        return <FileEdit className="h-4 w-4 text-blue-500" />;
      case "contract_deleted":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "contract_approved":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "contract_rejected":
        return <XCircle className="h-4 w-4 text-rose-500" />;
      case "user_assigned":
        return <UserPlus className="h-4 w-4 text-indigo-500" />;
      case "contract_signed":
        return <FileSignature className="h-4 w-4 text-purple-500" />;
      case "comment_added":
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case "access_granted":
        return <ShieldCheck className="h-4 w-4 text-teal-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "contract_created":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "contract_updated":
        return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300";
      case "contract_deleted":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      case "contract_approved":
        return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
      case "contract_rejected":
        return "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300";
      case "user_assigned":
        return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300";
      case "contract_signed":
        return "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      case "comment_added":
        return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
      case "access_granted":
        return "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  // Configuración de las animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 20 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
              <CardDescription>Últimas acciones en contratos</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              Ver todas
              <MoreHorizontal className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-10 w-10 mb-2 text-gray-400" />
              <p>No hay actividad reciente</p>
            </div>
          ) : (
            <motion.div className="space-y-0.5">
              {activities.map((activity, index) => {
                const colorClass = getActivityColor(activity.type);
                
                return (
                  <motion.div 
                    key={activity.id}
                    variants={itemVariants}
                    className="relative"
                  >
                    <div className="flex p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all">
                      <div className="flex-shrink-0 mr-3">
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800 shadow-sm">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {activity.user.name.split(" ").map(name => name[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {activity.user.name}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`px-2 py-0 h-5 ${colorClass} border-0`}
                            >
                              <span className="flex items-center gap-1 text-xs">
                                {getActivityIcon(activity.type)}
                                {activity.type.split("_").map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(" ")}
                              </span>
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {format(new Date(activity.timestamp), "HH:mm • d MMM", { locale: es })}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        {activity.metadata?.contractTitle && (
                          <div className="mt-1 text-xs text-gray-500 flex items-center">
                            <FileText className="h-3 w-3 mr-1" />
                            {activity.metadata.contractTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    {index < activities.length - 1 && (
                      <Separator className="mx-11" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 