import { addSupplement, editSupplement } from '../api/electronAPI';

const supplementService = {
  // Agregar un suplemento a un contrato
  addSupplement: async (contractId, supplementData) => {
    try {
      return await addSupplement(contractId, supplementData);
    } catch (error) {
      console.error('Error en supplementService.addSupplement:', error);
      throw error;
    }
  },

  // Editar un suplemento existente
  editSupplement: async (contractId, supplementId, supplementData) => {
    try {
      return await editSupplement(contractId, supplementId, supplementData);
    } catch (error) {
      console.error('Error en supplementService.editSupplement:', error);
      throw error;
    }
  },

  // Validar datos del suplemento
  validateSupplementData: (supplementData) => {
    const requiredFields = ['title', 'description', 'amount', 'date'];
    const missingFields = requiredFields.filter(field => !supplementData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

    if (supplementData.amount <= 0) {
      throw new Error('El monto del suplemento debe ser mayor a 0');
    }

    return true;
  },

  // Calcular total de suplementos
  calculateTotalSupplements: (supplements) => {
    return supplements.reduce((total, supplement) => total + supplement.amount, 0);
  }
};

export default supplementService;