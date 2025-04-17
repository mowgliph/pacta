import React from 'react';
import { useNotificationPreferences } from '../hooks/useNotifications';
import { Button } from './ui/button';

const notificationTypes = [
  { type: 'contract', label: 'Contratos' },
  { type: 'supplement', label: 'Suplementos' },
  { type: 'system', label: 'Sistema' },
];

const NotificationPreferences: React.FC = () => {
  const {
    preferences,
    isLoading,
    updatePreference,
    isUpdating,
    refetch
  } = useNotificationPreferences();

  const handleChange = (type: string, field: 'email' | 'inApp' | 'system', value: boolean) => {
    const pref = preferences.find((p: any) => p.type === type);
    if (pref) {
      updatePreference({
        type,
        data: {
          email: field === 'email' ? value : pref.email,
          inApp: field === 'inApp' ? value : pref.inApp,
          system: field === 'system' ? value : pref.system,
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 w-full max-w-xl">
      <h2 className="font-semibold text-lg mb-4">Preferencias de Notificaciones</h2>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left">Tipo</th>
            <th>En app</th>
            <th>Email</th>
            <th>Sistema</th>
          </tr>
        </thead>
        <tbody>
          {notificationTypes.map((nt) => {
            const pref = preferences.find((p: any) => p.type === nt.type) || {};
            return (
              <tr key={nt.type} className="border-t">
                <td className="py-2">{nt.label}</td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!pref.inApp}
                    disabled={isUpdating}
                    onChange={e => handleChange(nt.type, 'inApp', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!pref.email}
                    disabled={isUpdating}
                    onChange={e => handleChange(nt.type, 'email', e.target.checked)}
                  />
                </td>
                <td className="text-center">
                  <input
                    type="checkbox"
                    checked={!!pref.system}
                    disabled={isUpdating}
                    onChange={e => handleChange(nt.type, 'system', e.target.checked)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-right">
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isLoading || isUpdating}>
          Refrescar
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
