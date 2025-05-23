import { ApiResponse } from './common';

export interface NotificationOptions {
  title: string;
  body: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
  description?: string;
  silent?: boolean;
}

export interface NotificationsAPI {
  show: (options: NotificationOptions) => Promise<void>;
}
