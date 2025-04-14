import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { selectFile, uploadContractFile } from '../api/electronAPI';
import type { Contract } from '../types/contracts';

interface ContractUploadProps {
  contractId: string;
  onUploadComplete?: (success: boolean, fileUrl?: string) => void;
}

interface Notification {
  type: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

const ContractUpload: React.FC<ContractUploadProps> = ({ contractId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileSelect = async () => {
    try {
      const filePath = await selectFile({
        filters: [
          { name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }
        ]
      });
      setSelectedFile(filePath);
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !contractId) {
      onUploadComplete?.(false);
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadContractFile(contractId, selectedFile);
      onUploadComplete?.(true, result.fileUrl);
    } catch (error) {
      console.error('Error al subir archivo:', error);
      onUploadComplete?.(false);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      console.log('Nueva notificación:', notification);
    };

    window.electron.ipcRenderer.on('notification:new', handleNotification);
    return () => {
      window.electron.ipcRenderer.removeAllListeners('notification:new');
    };
  }, []);

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={handleFileSelect}
        disabled={isUploading}
      >
        Seleccionar Archivo
      </Button>
      
      {selectedFile && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Archivo seleccionado: {selectedFile}
          </p>
          <Button 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Subiendo...' : 'Subir Contrato'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ContractUpload;