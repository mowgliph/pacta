import React from 'react';
import { Toast } from '@/renderer/components/ui/toast';
import { Button } from '@/renderer/components/ui/button';
import { X } from 'lucide-react';

type NotificationType = 'default' | 'success' | 'error' | 'warning';
type ToastVariant = 'default' | 'destructive';

const mapTypeToVariant = (type: NotificationType): ToastVariant => {
  switch (type) {
    case 'error':
    case 'warning':
      return 'destructive';
    default:
      return 'default';
  }
};

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  type?: NotificationType;
  onDismiss: (id: string) => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  title,
  message,
  type = 'default',
  onDismiss,
  duration = 5000
}) => {
  return (
    <Toast
      variant={mapTypeToVariant(type)}
      duration={duration}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDismiss(id)}
          className="-m-2"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Toast>
  );
};

export default Notification;