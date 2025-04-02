import React from 'react';
import { useParams } from '@remix-run/react';
import { MetaFunction } from '@remix-run/node';
import { SupplementCreatePage } from '../../../../features/contracts/pages/SupplementCreatePage';

export const meta: MetaFunction = () => {
  return [
    { title: "PACTA - Nuevo Suplemento" },
    { name: "description", content: "Crear un nuevo suplemento para el contrato" },
  ];
};

/**
 * Ruta para crear un nuevo suplemento para un contrato
 */
export default function NewSupplement() {
  const { id } = useParams();
  
  if (!id) {
    return <div>ID de contrato no válido</div>;
  }
  
  return <SupplementCreatePage contractId={id} />;
} 