import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './routeTree.gen';
import './index.css';

// Create the root element for React to render into
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

// Inicializa el router
const init = async () => {
  // Registrar el router
  await router.load();
  
  // Renderizar la aplicación
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
};

init(); 