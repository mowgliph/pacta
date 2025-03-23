import { useNotificationStore } from '@/stores/notification';
import type { NotificationType } from '@/types/notification';

export class NotificationService {
  private static readonly LICENSE_NOTIFICATIONS = {
    EXPIRING_SOON: {
      id: 'license-expiring',
      type: 'warning' as NotificationType,
      title: 'License Expiring Soon',
      persistent: true,
      group: 'license'
    },
    EXPIRED: {
      id: 'license-expired',
      type: 'error' as NotificationType,
      title: 'License Expired',
      persistent: true,
      group: 'license'
    },
    ACTIVATION_SUCCESS: {
      id: 'license-activated',
      type: 'success' as NotificationType,
      title: 'License Activated',
      timeout: 5000,
      group: 'license'
    }
  };

  private static readonly CONTRACT_NOTIFICATIONS = {
    EXPIRING_SOON: {
      id: 'contract-expiring',
      type: 'warning' as NotificationType,
      title: 'Contract Expiring Soon',
      persistent: true,
      group: 'contract'
    },
    RENEWAL_DUE: {
      id: 'contract-renewal',
      type: 'info' as NotificationType,
      title: 'Contract Renewal Due',
      persistent: true,
      group: 'contract'
    },
    LIMIT_REACHED: {
      id: 'contract-limit',
      type: 'warning' as NotificationType,
      title: 'Contract Limit Reached',
      persistent: true,
      group: 'contract'
    }
  };

  private static store = useNotificationStore();

  // Notificaciones de Licencia
  static notifyLicenseExpiringSoon(daysRemaining: number): void {
    this.store.add({
      ...this.LICENSE_NOTIFICATIONS.EXPIRING_SOON,
      message: `Your license will expire in ${daysRemaining} days. Please renew to maintain access.`
    });
  }

  static notifyLicenseExpired(): void {
    this.store.add({
      ...this.LICENSE_NOTIFICATIONS.EXPIRED,
      message: 'Your license has expired. Please renew to restore access.'
    });
  }

  static notifyLicenseActivated(): void {
    this.store.add({
      ...this.LICENSE_NOTIFICATIONS.ACTIVATION_SUCCESS,
      message: 'License has been successfully activated.'
    });
  }

  // Notificaciones de Contratos
  static notifyContractExpiringSoon(contractId: string, daysRemaining: number): void {
    this.store.add({
      ...this.CONTRACT_NOTIFICATIONS.EXPIRING_SOON,
      id: `contract-expiring-${contractId}`,
      message: `Contract #${contractId} will expire in ${daysRemaining} days.`,
      action: {
        label: 'View Contract',
        route: { name: 'contract-details', params: { id: contractId } }
      }
    });
  }

  static notifyContractRenewalDue(contractId: string): void {
    this.store.add({
      ...this.CONTRACT_NOTIFICATIONS.RENEWAL_DUE,
      id: `contract-renewal-${contractId}`,
      message: `Contract #${contractId} is due for renewal.`,
      action: {
        label: 'Renew Now',
        route: { name: 'contract-renewal', params: { id: contractId } }
      }
    });
  }

  static notifyContractLimitReached(): void {
    this.store.add({
      ...this.CONTRACT_NOTIFICATIONS.LIMIT_REACHED,
      message: 'You have reached the maximum number of contracts allowed by your license.',
      action: {
        label: 'Upgrade License',
        route: { name: 'license-upgrade' }
      }
    });
  }

  // Métodos de utilidad
  static clearLicenseNotifications(): void {
    this.store.clearGroup('license');
  }

  static clearContractNotifications(contractId?: string): void {
    if (contractId) {
      this.store.remove(`contract-expiring-${contractId}`);
      this.store.remove(`contract-renewal-${contractId}`);
    } else {
      this.store.clearGroup('contract');
    }
  }

  static clearAll(): void {
    this.store.clearAll();
  }
} 