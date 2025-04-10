import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ContractFilters = ({ filters, onFilterChange }) => {
  const handleDateRangeChange = (dates) => {
    const [start, end] = dates;
    onFilterChange({ ...filters, dateRange: { start, end } });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="all">Todos</option>
            <option value="Active">Activos</option>
            <option value="Pending">Pendientes</option>
            <option value="Expired">Vencidos</option>
            <option value="Terminated">Terminados</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rango de Fechas</label>
          <DatePicker
            selectsRange={true}
            startDate={filters.dateRange?.start}
            endDate={filters.dateRange?.end}
            onChange={handleDateRangeChange}
            className="w-full rounded-md border-gray-300 shadow-sm"
            placeholderText="Seleccionar rango"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Buscar</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Buscar contratos..."
            className="w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ContractFilters;