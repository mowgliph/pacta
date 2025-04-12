import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from "@/renderer/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/renderer/components/ui/popover";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { toast } from 'sonner';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const handleNewNotification = (event, data) => {
      const newNotification = {
        id: Date.now(),
        ...data,
        read: false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Mostrar toast según el tipo de notificación
      switch (data.type) {
        case 'contract_vencimiento':
          toast.warning(data.message, {
            description: data.description || '',
            duration: 5000,
          });
          break;
        case 'contract_creacion':
        case 'supplement_creacion':
          toast.success(data.message, {
            description: data.description || '',
            duration: 5000,
          });
          break;
        case 'system_error':
          toast.error(data.message, {
            description: data.description || '',
            duration: 5000,
          });
          break;
        default:
          toast.info(data.message, {
            description: data.description || '',
            duration: 5000,
          });
      }
    };

    window.electron.ipcRenderer.on('notification:new', handleNewNotification);
    return () => {
      window.electron.ipcRenderer.removeListener('notification:new', handleNewNotification);
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await window.electron.ipcRenderer.invoke('notification:markAsRead', id);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      toast.error('Error al marcar notificación como leída');
    }
  };

  const clearAll = async () => {
    try {
      await window.electron.ipcRenderer.invoke('notification:markAllAsRead');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error al limpiar notificaciones:', error);
      toast.error('Error al limpiar notificaciones');
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <BellIcon className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">{t('notifications.title')}</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {t('notifications.markAllAsRead')}
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              {t('notifications.empty')}
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 ${!notification.read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      {notification.description && (
                        <p className="text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => markAsRead(notification.id)}
                        className="h-8 w-8"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications; 