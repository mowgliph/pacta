import React from 'react';
import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">
          Bienvenido a PACTA
        </h1>
        <p className="mb-8 text-lg text-gray-700">
          Sistema de gestión de contratos y suplementos.
        </p>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link 
            to="/dashboard" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Dashboard</span>
            <span className="text-center text-gray-600">
              Visualiza estadísticas y resumenes
            </span>
          </Link>
          
          <Link 
            to="/contratos" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Contratos</span>
            <span className="text-center text-gray-600">
              Gestiona los contratos activos
            </span>
          </Link>
          
          <Link 
            to="/suplementos" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Suplementos</span>
            <span className="text-center text-gray-600">
              Administra los suplementos de contratos
            </span>
          </Link>
          
          <Link 
            to="/usuarios" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Usuarios</span>
            <span className="text-center text-gray-600">
              Gestiona usuarios y permisos
            </span>
          </Link>
          
          <Link 
            to="/reportes" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Reportes</span>
            <span className="text-center text-gray-600">
              Genera reportes y estadísticas
            </span>
          </Link>
          
          <Link 
            to="/configuracion" 
            className="flex flex-col items-center rounded-lg border border-gray-200 p-6 transition hover:bg-gray-50 hover:shadow-md"
          >
            <span className="mb-2 text-xl font-semibold">Configuración</span>
            <span className="text-center text-gray-600">
              Ajusta parámetros del sistema
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
} 