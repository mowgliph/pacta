import React, { ReactNode } from 'react'

/**
 * Layout para las páginas de contratos
 * Provee estructura común para todas las páginas de la sección de contratos
 */
export const ContractsLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="container py-6 space-y-6">
      {children}
    </div>
  )
} 