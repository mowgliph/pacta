import React, { useState, useEffect } from 'react';
import ContractList from './contractList';
import ContractForm from './contractForm';
import ContractFilters from './contractFilters';
import ContractDetails from './contractDetails';
import { useToast } from '../../../utils/toastConfig';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    search: ''
  });
  const toast = useToast();

  useEffect(() => {
    loadContracts();
  }, [filters]);

  const loadContracts = async () => {
    try {
      const result = await window.electronAPI.contracts.getAll(filters);
      setContracts(result);
    } catch (error) {
      toast.error('Error al cargar contratos');
    }
  };

  const handleCreateContract = async (contractData) => {
    try {
      await window.electronAPI.contracts.create(contractData);
      toast.success('Contrato creado exitosamente');
      loadContracts();
    } catch (error) {
      toast.error('Error al crear contrato');
    }
  };

  const handleUpdateContract = async (id, data) => {
    try {
      await window.electronAPI.contracts.update(id, data);
      toast.success('Contrato actualizado exitosamente');
      loadContracts();
    } catch (error) {
      toast.error('Error al actualizar contrato');
    }
  };

  const handleDeleteContract = async (id) => {
    try {
      await window.electronAPI.contracts.delete(id);
      toast.success('Contrato eliminado exitosamente');
      loadContracts();
    } catch (error) {
      toast.error('Error al eliminar contrato');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Contratos</h1>
      <ContractFilters filters={filters} onFilterChange={setFilters} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <ContractList 
            contracts={contracts}
            onSelect={setSelectedContract}
            onDelete={handleDeleteContract}
          />
          <ContractForm onSubmit={handleCreateContract} />
        </div>
        {selectedContract && (
          <ContractDetails 
            contract={selectedContract}
            onUpdate={handleUpdateContract}
          />
        )}
      </div>
    </div>
  );
};

export default ContractManagement;