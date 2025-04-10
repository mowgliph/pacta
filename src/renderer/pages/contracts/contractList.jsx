import React from 'react';

const ContractList = ({ contracts, onSelect, onDelete }) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Contratos</h2>
      <div className="space-y-2">
        {contracts.map(contract => (
          <div 
            key={contract.id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <div onClick={() => onSelect(contract)} className="cursor-pointer">
              <h3 className="font-medium">{contract.name}</h3>
              <p className="text-sm text-gray-600">
                Estado: {contract.status}
              </p>
              <p className="text-sm text-gray-600">
                Vence: {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onDelete(contract.id)}
              className="text-red-600 hover:text-red-800"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContractList;