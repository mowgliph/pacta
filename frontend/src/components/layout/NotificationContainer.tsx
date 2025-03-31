import React from 'react';
import { useStore } from '@/store';
import { StatusBanner } from './StatusBanner';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useStore((state) => ({
    notifications: state.notifications,
    removeNotification: state.removeNotification
  }));

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 w-80 pointer-events-none"
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <StatusBanner
            type={notification.type}
            title={notification.title}
            message={notification.message}
            action={notification.action}
            onDismiss={() => removeNotification(notification.id)}
            className="shadow-lg"
          />
        </div>
      ))}
    </div>
  );
}; 