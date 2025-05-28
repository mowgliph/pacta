import { 
  ClockIcon, 
  FileTextIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon, 
  CrossCircledIcon 
} from '@radix-ui/react-icons';

interface ActivityItem {
  id: string;
  type: 'contract' | 'supplement' | 'document' | 'login' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
}

const activityIcons = {
  contract: FileTextIcon,
  supplement: CheckCircledIcon,
  document: FileTextIcon,
  login: ClockIcon,
  system: ExclamationTriangleIcon,
};

export function ActivityFeed({ activities, maxItems = 5, className }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Hace unos segundos';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return `Hace ${Math.floor(diffInSeconds / 604800)} semanas`;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {displayedActivities.map((activity) => {
            const Icon = activityIcons[activity.type] || FileTextIcon;
            return (
              <div key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Icon className="h-4 w-4 text-azul-medio" />
                    </div>
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {activity.timestamp ? formatTimeAgo(activity.timestamp) : 'Sin fecha'}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {activity.timestamp ? formatDateTime(activity.timestamp) : 'Sin fecha'}
                      </span>
                    </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                    {activity.user && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        {activity.user.avatar ? (
                          <img
                            className="h-5 w-5 rounded-full mr-2"
                            src={activity.user.avatar}
                            alt={activity.user.name}
                          />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 mr-2">
                            {activity.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {activities.length > maxItems && (
          <div className="px-6 py-3 bg-gray-50 text-center">
            <button className="text-sm font-medium text-azul-medio hover:text-azul-oscuro">
              Ver toda la actividad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
