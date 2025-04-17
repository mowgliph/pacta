import React from 'react';
import { Button } from './ui/button';
import { useNotifications } from '../hooks/useNotifications';
import { Check, Bell } from 'lucide-react';
import type { Notification } from '../types/Notification';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    isLoading,
    markNotificationRead,
    markAllNotificationsRead,
    isMarkingRead,
    refetch
  } = useNotifications();

  return (
    <div className="w-80 bg-white shadow-lg rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <span className="font-semibold">Notificaciones</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => markAllNotificationsRead()}
          disabled={isMarkingRead || notifications.length === 0}
        >
          <Check className="w-4 h-4 mr-1" /> Marcar todas como leídas
        </Button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Cargando...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No hay notificaciones nuevas</div>
        ) : notifications.map((n: Notification) => (
          <div
            key={n.id}
            className={`flex items-start gap-2 py-3 px-1 ${n.isRead ? 'opacity-60' : ''}`}
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{n.title || n.type}</div>
              <div className="text-xs text-gray-600 mb-1">{n.message}</div>
              <div className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            {!n.isRead && (
              <Button
                size="icon"
                variant="ghost"
                title="Marcar como leída"
                onClick={() => markNotificationRead(n.id)}
                disabled={isMarkingRead}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPanel;
