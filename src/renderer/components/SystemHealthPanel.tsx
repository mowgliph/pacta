import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, AlertTriangle, Database, Server, HardDrive, Mail } from 'lucide-react';
import axios from 'axios';

const fetchHealth = async () => {
  const res = await axios.get('/api/health');
  return res.data;
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'OK':
      return <CheckCircle className="text-green-500 w-5 h-5" />;
    case 'ERROR':
      return <XCircle className="text-red-500 w-5 h-5" />;
    case 'NOT_CONFIGURED':
      return <AlertTriangle className="text-yellow-500 w-5 h-5" />;
    default:
      return <AlertTriangle className="text-gray-400 w-5 h-5" />;
  }
};

const SystemHealthPanel: React.FC = () => {
  const { data, isLoading, refetch } = useQuery(['systemHealth'], fetchHealth, { refetchInterval: 60000 });

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 w-full">
      <div className="flex items-center gap-2 mb-3">
        <Server className="w-5 h-5 text-blue-500" />
        <span className="font-semibold">Salud del Sistema</span>
        <button className="ml-auto text-xs text-blue-600 hover:underline" onClick={() => refetch()} disabled={isLoading}>
          Refrescar
        </button>
      </div>
      {isLoading ? (
        <div className="text-center text-gray-400 py-8">Cargando...</div>
      ) : (
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-700" />
            <span className="flex-1">Base de datos</span>
            {statusIcon(data?.database)}
          </li>
          <li className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-700" />
            <span className="flex-1">Correo SMTP</span>
            {statusIcon(data?.smtp)}
          </li>
          <li className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-700" />
            <span className="flex-1">Backups</span>
            {data?.backups?.count > 0 ? (
              <span className="text-xs text-gray-600">Último: {data?.backups?.lastBackup ? new Date(data.backups.lastBackup).toLocaleString() : 'N/A'}</span>
            ) : (
              <span className="text-xs text-red-500">Sin backups</span>
            )}
          </li>
          <li className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-gray-700" />
            <span className="flex-1">Espacio en disco</span>
            {data?.disk?.free !== null && data?.disk?.total !== null ? (
              <span className="text-xs text-gray-600">{((data.disk.free / data.disk.total) * 100).toFixed(1)}% libre</span>
            ) : (
              <span className="text-xs text-gray-400">N/A</span>
            )}
          </li>
        </ul>
      )}
    </div>
  );
};

export default SystemHealthPanel;
