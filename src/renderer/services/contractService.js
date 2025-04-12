import { fetchContracts, fetchContractDetails, createContract, updateContract } from '../api/electronAPI';

export const contractService = {
  // Obtener todos los contratos
  getAllContracts: async () => {
    try {
      return await fetchContracts();
    } catch (error) {
      console.error('Error en contractService.getAllContracts:', error);
      throw error;
    }
  },

  // Obtener detalles de un contrato
  getContractDetails: async (contractId) => {
    try {
      return await fetchContractDetails(contractId);
    } catch (error) {
      console.error('Error en contractService.getContractDetails:', error);
      throw error;
    }
  },

  // Crear un nuevo contrato
  createContract: async (contractData) => {
    try {
      return await createContract(contractData);
    } catch (error) {
      console.error('Error en contractService.createContract:', error);
      throw error;
    }
  },

  // Actualizar un contrato existente
  updateContract: async (contractId, contractData) => {
    try {
      return await updateContract(contractId, contractData);
    } catch (error) {
      console.error('Error en contractService.updateContract:', error);
      throw error;
    }
  },

  // Validar datos del contrato
  validateContractData: (contractData) => {
    const requiredFields = ['title', 'startDate', 'endDate', 'status'];
    const missingFields = requiredFields.filter(field => !contractData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    if (new Date(contractData.endDate) < new Date(contractData.startDate)) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio');
    }

    return true;
  }
}; 