import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routes';
import './index.css';

// Componente para mostrar mientras se carga la aplicación
const LoadingComponent = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
  </div>
);

// Inicializa el router y renderiza la aplicación
async function init() {
  // Elemento raíz para React
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('No se encontró el elemento root');

  // Crear el root de React
  const root = ReactDOM.createRoot(rootElement);
  
  // Renderizar componente de carga
  root.render(
    <React.StrictMode>
      <LoadingComponent />
    </React.StrictMode>
  );

  // Cargar el router
  await router.load();
  
  // Renderizar la aplicación con el router
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

// Iniciar la aplicación
init().catch(err => {
  console.error('Error al inicializar la aplicación:', err);
}); 