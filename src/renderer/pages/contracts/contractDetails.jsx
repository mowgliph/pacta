import React, { useState } from 'react';
import ContractForm from './contractForm';
import SupplementModal from './SupplementModal';
import { Button } from '@/renderer/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ContractDetails = ({ contract, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSupplementModalOpen, setIsSupplementModalOpen] = useState(false);
  const [selectedSupplement, setSelectedSupplement] = useState(null);
  const toast = useToast();

  const handleUpdate = async (data) => {
    await onUpdate(contract.id, data);
    setIsEditing(false);
  };

  const handleSupplementSubmit = async (supplementData) => {
    try {
      if (selectedSupplement) {
        await window.electronAPI.contracts.editSupplement(
          contract.id,
          selectedSupplement.id,
          supplementData
        );
      } else {
        await window.electronAPI.contracts.addSupplement(contract.id, supplementData);
      }
      toast.success({
        title: selectedSupplement ? 'Suplemento actualizado' : 'Suplemento añadido',
        description: 'La operación se completó exitosamente'
      });
    } catch (error) {
      toast.error({
        title: 'Error',
        description: 'No se pudo procesar el suplemento'
      });
    }
  };

  if (isEditing) {
    return <ContractForm onSubmit={handleUpdate} initialData={contract} />;
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Detalles del Contrato</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Editar
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium">Información General</h3>
          <p className="text-gray-600">Nombre: {contract.name}</p>
          <p className="text-gray-600">Estado: {contract.status}</p>
          <p className="text-gray-600">
            Fecha Inicio: {new Date(contract.startDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600">
            Fecha Fin: {new Date(contract.endDate).toLocaleDateString()}
          </p>
        </div>

        <div>
          <h3 className="font-medium">Descripción</h3>
          <p className="text-gray-600">{contract.description}</p>
        </div>

        {contract.fileUrl && (
          <div>
            <h3 className="font-medium">Documento</h3>
            <button
              onClick={() => window.electronAPI.files.open(contract.fileUrl)}
              className="text-blue-600 hover:text-blue-800"
            >
              Ver documento
            </button>
          </div>
        )}

        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Suplementos</h3>
            <Button
              onClick={() => {
                setSelectedSupplement(null);
                setIsSupplementModalOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              Añadir Suplemento
            </Button>
          </div>

          {contract.supplements?.length > 0 ? (
            <div className="space-y-2">
              {contract.supplements.map(supplement => (
                <div
                  key={supplement.id}
                  className="border rounded-md p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{supplement.description}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(supplement.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-x-2">
                    {supplement.filePath && (
                      <Button
                        onClick={() => window.electronAPI.files.open(supplement.filePath)}
                        variant="ghost"
                        size="sm"
                      >
                        Ver documento
                      </Button>
                    )}
                    <Button
                      onClick={() => {
                        setSelectedSupplement(supplement);
                        setIsSupplementModalOpen(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No hay suplementos registrados</p>
          )}
        </div>
      </div>

      <SupplementModal
        isOpen={isSupplementModalOpen}
        onClose={() => {
          setIsSupplementModalOpen(false);
          setSelectedSupplement(null);
        }}
        onSubmit={handleSupplementSubmit}
        initialData={selectedSupplement}
      />
    </div>
  );
};

export default ContractDetails;