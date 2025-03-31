import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// Importar el árbol de rutas generado o definido manualmente
// Si usas generación automática, sería algo como:
// import { routeTree } from './routeTree.gen' 
// Como lo definimos manualmente:
import { routerConfig } from './routes/routes'

// Crear la instancia del router
const router = createRouter(routerConfig)

// Registrar el router para tipos seguros
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Montar la aplicación
const rootElement = document.getElementById('root')
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  )
}
