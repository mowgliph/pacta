import React, { useState, useEffect } from 'react';

interface ContractUploadProps {
  onUploadComplete?: (success: boolean) => void;
}

interface Notification {
  type: string;
  message: string;
}

const ContractUpload: React.FC<ContractUploadProps> = ({ onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const handleFileSelect = async () => {
    const filePath = await window.electronAPI.files.select();
    setSelectedFile(filePath);
  };

  const handleUpload = async (contractId: number) => {
    if (!selectedFile) {
      onUploadComplete?.(false);
      return;
    }

    try {
      await window.electronAPI.contracts.uploadDocument(contractId, selectedFile);
      onUploadComplete?.(true);
    } catch (error) {
      onUploadComplete?.(false);
    }
  };

  useEffect(() => {
    const handleNotification = (notification: Notification) => {
      console.log('Nueva notificación:', notification);
    };

    window.electronAPI.notifications.subscribe(handleNotification);
    return () => window.electronAPI.notifications.unsubscribe();
  }, []);

  return (
    <div>
      <button onClick={handleFileSelect}>Seleccionar Archivo</button>
      {selectedFile && <p>Archivo seleccionado: {selectedFile}</p>}
      <button onClick={() => handleUpload(1)}>Subir Contrato</button>
    </div>
  );
};

export default ContractUpload;