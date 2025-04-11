import { zodResolver } from '@hookform/resolvers/zod';
import {
  ContractSchema,
  SupplementSchema,
  EmpresaSchema,
  DepartamentoSchema,
  AuditoriaSchema
} from './validation/schemas';

export const contractResolver = zodResolver(ContractSchema);
export const supplementResolver = zodResolver(SupplementSchema);
export const empresaResolver = zodResolver(EmpresaSchema);
export const departamentoResolver = zodResolver(DepartamentoSchema);
export const auditoriaResolver = zodResolver(AuditoriaSchema);

export const getFormResolver = (schemaType) => {
  const resolvers = {
    contract: contractResolver,
    supplement: supplementResolver,
    empresa: empresaResolver,
    departamento: departamentoResolver,
    auditoria: auditoriaResolver
  };
  
  return resolvers[schemaType] || contractResolver;
};