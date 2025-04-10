import React, { useState } from 'react';

const ContractForm = ({ onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.file) {
      const filePath = await window.electronAPI.files.select();
      formData.fileUrl = filePath;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-4 mt-4">
      <h2 className="text-xl font-semibold mb-4">
        {initialData ? 'Editar Contrato' : 'Nuevo Contrato'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            rows="3"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Fecha Inicio</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={e => setFormData({...formData, startDate: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fecha Fin</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={e => setFormData({...formData, endDate: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="Active">Activo</option>
            <option value="Pending">Pendiente</option>
            <option value="Expired">Vencido</option>
            <option value="Terminated">Terminado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Documento</label>
          <input
            type="file"
            onChange={e => setFormData({...formData, file: e.target.files[0]})}
            className="mt-1 block w-full"
            accept=".pdf,.doc,.docx"
          />
        </div>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
      >
        {initialData ? 'Actualizar' : 'Crear'} Contrato
      </button>
    </form>
  );
};

export default ContractForm;