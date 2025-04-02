import React from 'react';
import { useParams } from '@remix-run/react';
import { MetaFunction } from '@remix-run/node';
import { ContractEditPage } from '../../../features/contracts/pages/ContractEditPage';

export const meta: MetaFunction = () => {
  return [
    { title: "PACTA - Editar Contrato" },
    { name: "description", content: "Modificar detalles del contrato" },
  ];
};

/**
 * Ruta para editar un contrato
 */
export default function EditContract() {
  const { id } = useParams();
  
  if (!id) {
    return <div>ID de contrato no válido</div>;
  }
  
  return <ContractEditPage id={id} />;
} 