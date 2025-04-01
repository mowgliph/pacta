import React from 'react'
import { Outlet } from '@tanstack/react-router'

/**
 * Layout para las páginas de contratos
 * Provee estructura común para todas las páginas de la sección de contratos
 */
export const ContractsLayout: React.FC = () => {
  return (
    <div className="container py-6 space-y-6">
      <Outlet />
    </div>
  )
} 