import React, { useState } from 'react';
import { useBackupSchedule, useSmtpConfig, usePublicDashboardStatus } from '../hooks/useSystemSettings';
import { Button } from './ui/button';

const SystemSettingsPanel: React.FC = () => {
  // Backup
  const { data: backup, updateBackupSchedule, isUpdating: isBackupUpdating } = useBackupSchedule();
  const [interval, setInterval] = useState(24);
  // SMTP
  const { data: smtp, updateSmtpConfig, isUpdating: isSmtpUpdating, testSmtpConfig, isTesting, testResult } = useSmtpConfig();
  const [smtpForm, setSmtpForm] = useState<any>(smtp || {});
  // Modo público
  const { data: publicStatus, updatePublicDashboardStatus, isUpdating: isPublicUpdating } = usePublicDashboardStatus();

  // Handlers
  const handleBackupSave = () => {
    updateBackupSchedule({ enabled: true, intervalHours: interval });
  };
  const handleSmtpSave = () => {
    updateSmtpConfig(smtpForm);
  };
  const handleSmtpTest = async () => {
    await testSmtpConfig(smtpForm);
  };
  const handlePublicToggle = () => {
    updatePublicDashboardStatus(!publicStatus?.enabled);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 w-full max-w-2xl mx-auto space-y-8">
      <h2 className="font-semibold text-xl mb-4">Configuración Avanzada del Sistema</h2>
      {/* Backup */}
      <section>
        <h3 className="font-semibold mb-2">Backups automáticos</h3>
        <div className="flex items-center gap-4 mb-2">
          <label className="text-sm">Intervalo (horas):</label>
          <input
            type="number"
            min={1}
            max={168}
            value={interval}
            onChange={e => setInterval(Number(e.target.value))}
            className="border rounded px-2 py-1 w-20"
            disabled={isBackupUpdating}
          />
          <Button size="sm" onClick={handleBackupSave} disabled={isBackupUpdating}>
            Guardar
          </Button>
        </div>
        <div className="text-xs text-gray-500">Última configuración: {backup?.intervalHours || 'N/A'}h</div>
      </section>
      {/* SMTP */}
      <section>
        <h3 className="font-semibold mb-2">Correo SMTP</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <input
            type="text"
            placeholder="Host"
            value={smtpForm.host || ''}
            onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={isSmtpUpdating}
          />
          <input
            type="number"
            placeholder="Puerto"
            value={smtpForm.port || ''}
            onChange={e => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
            className="border rounded px-2 py-1"
            disabled={isSmtpUpdating}
          />
          <input
            type="text"
            placeholder="Usuario"
            value={smtpForm.username || ''}
            onChange={e => setSmtpForm({ ...smtpForm, username: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={isSmtpUpdating}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={smtpForm.password || ''}
            onChange={e => setSmtpForm({ ...smtpForm, password: e.target.value })}
            className="border rounded px-2 py-1"
            disabled={isSmtpUpdating}
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSmtpSave} disabled={isSmtpUpdating}>
            Guardar
          </Button>
          <Button size="sm" variant="outline" onClick={handleSmtpTest} disabled={isTesting}>
            Probar conexión
          </Button>
        </div>
        {testResult && (
          <div className={`mt-2 text-xs ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>{testResult.message}</div>
        )}
      </section>
      {/* Modo público */}
      <section>
        <h3 className="font-semibold mb-2">Dashboard público</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm">Habilitar modo público:</span>
          <input
            type="checkbox"
            checked={!!publicStatus?.enabled}
            onChange={handlePublicToggle}
            disabled={isPublicUpdating}
          />
        </div>
      </section>
    </div>
  );
};

export default SystemSettingsPanel;
