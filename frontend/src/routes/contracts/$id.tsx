import { LoaderFunction, json } from '@remix-run/node';
import { useLoaderData, useParams } from '@remix-run/react';
import { MetaFunction } from '@remix-run/node';
import { ContractDetailsPage } from '../../features/contracts/pages/ContractDetailsPage';
import React from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: "PACTA - Detalle de Contrato" },
    { name: "description", content: "Ver detalles del contrato" },
  ];
};

/**
 * Ruta dinámica para detalles de contrato
 */
export default function ContractDetails() {
  const { id } = useParams();
  
  if (!id) {
    return <div>ID de contrato no válido</div>;
  }
  
  return <ContractDetailsPage id={id} />;
} 