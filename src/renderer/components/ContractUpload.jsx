import React, { useState, useEffect } from 'react';

const ContractUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleFileSelect = async () => {
    const filePath = await window.electronAPI.files.select();
    setSelectedFile(filePath);
  };

  const handleUpload = async (contractId) => {
    try {
      await window.electronAPI.contracts.uploadDocument(contractId, selectedFile);
      // Mostrar mensaje de éxito
    } catch (error) {
      // Manejar error
    }
  };

  // Escuchar notificaciones
  useEffect(() => {
    const handleNotification = (notification) => {
      // Mostrar notificación usando tu sistema de UI
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